/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator , clearTimeout , setTimeout*/
(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());


define(['d3', 'utils/utils', 'libs/easing', 'libs/howler'], function (ignore, _util, FX, audio) {

    "use strict";

    var Chart,
        forceLayout,
        canvas;

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function Particle(radius, explodeX, explodeY, opt) {

        var options = opt || {};

        this.initPos = {
            x: options.startX || 0,
            y: options.startY || 0
        };
        this.pos = {
            x: 0,
            y: 0,
        };
        this.id = Math.random();
        this.radius = radius;
        this.explode = false;
        this.distanceX = explodeX - this.initPos.x;
        this.distanceY = explodeY - this.initPos.y;
        this.time = 0;
        this.easing = options.easing || 'easeInQuad';
        this.duration = options.time || 1000;
        this.alpha = options.alpha | 1;

        this.reset = function (r) {
            this.radius = r;
        };

        var r = Math.floor(Math.random() * 255);
        var g = Math.floor(Math.random() * 255);
        var b = Math.floor(Math.random() * 255);
        this.color = options.color || "rgba(" + r + "," + g + "," + b + ",.5)";

        this.compositeOperation = 'lighter';

        this.update = function () {

            if (this.alpha <= 0) {
                return;
            }
            if (this.explode) {
                this.alpha -= 0.03;
            }

            if (this.time < this.duration) {
                var progressX = FX[this.easing](this.time, 0, this.distanceX, this.duration);
                var progressY = FX[this.easing](this.time, 0, this.distanceY, this.duration);

                this.pos.x = (this.initPos.x + progressX);
                this.pos.y = (this.initPos.y + progressY);
                this.time += (1000 / 60);

            } else {
                this.exploding();
            }

        };
        this.draw = function (cx) {
            if (this.alpha <= 0) {
                return;
            }
            cx.save();
            cx.translate(this.pos.x, this.pos.y);
            cx.globalAlpha = this.alpha;
            //cx.globalCompositeOperation = this.compositeOperation;  //fix :mozilla bug
            cx.strokeStyle = "#ffffff";
            cx.fillStyle = this.color;
            cx.lineWidth = 0;
            cx.beginPath();
            cx.arc(0, 0, this.radius, 0, Math.PI * 2, true);
            cx.closePath();
            cx.fill();
            cx.restore();
        };
        this.exploding = function () {
            this.explode = true;
            this.radius *= 1.095;
        };

    }


    var getColor = d3.scale.linear().domain([0, 1]).range(['rgb(199, 233, 180)', 'rgb(65, 182, 196)']);

    function convertHex(hex, opacity) {
        hex = hex.replace('#', '');
        var r = parseInt(hex.substring(0, 2), 16),
            g = parseInt(hex.substring(2, 4), 16),
            b = parseInt(hex.substring(4, 6), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
    }

    var TimeLine = function (canvas, chart, explodes) {
        this.canvas = canvas;
        this.chart = chart;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.initialExploders = explodes.slice(0);
        this.explodeTime = explodes;
        this.exploders = [];
        this.animationId = 0;
        this.currentPos = 0;
        this.totalDuration = 0;
        this.interval = 1000 / 60;
        this.isPlaying = false;
        this.scale = 0; //totalDuration/this.width
        this.pause = false;
        this.stop = true;
        this.finishPlayed = false;
        this.onFinish = function () {};

        this.timeProgressBar = {};
        this.progressBar = function (duration, len, speed) {
            this.time = 0;
            this.progress = 0;
            this.duration = duration || (4 * 1000);
            this.length = len || 1000;
            this.speed = speed || 1;
            this.cueLines = 0;
            this.intensity = 0;
            this.timeColor = 'rgb(199, 233, 180)';
            this.color = 0;
            this.update = function (timeline) {
                if (this.time < this.duration) {
                    var progressX = FX[this.easing || 'linear'](this.time, 0, this.length, this.duration);
                    this.progress = progressX;
                    this.time += (16.67 * this.speed); //1000/60 * speed;
                    this.intensity = (this.intensity <= 0) ? 0 : (this.intensity -= 0.005);
                    this.color = (this.color <= 0) ? 0 : (this.color -= 0.005);
                } else {

                    timeline.stop = true;
                    timeline.finishPlayed = true;
                    if (typeof timeline.onFinish === 'function' && (timeline.exploders.length === 0)) {
                        timeline.onFinish(timeline.initialExploders);
                        cancelAnimationFrame(timeline.animationId);
                    }
                }
            };
        };
        this.drawTimelinePanel = function () {
            var that = this;
            var ctx = this.ctx;
            ctx.fillStyle = "white";
            ctx.fillRect(0, (this.height - 100), this.width, 5);

            ctx.strokeStyle = this.timeProgressBar.timeColor; //"rgba(76, 155, 46, 1)";
            ctx.fillStyle = this.timeProgressBar.timeColor; //"rgba(76, 155, 46, 1)";
            ctx.beginPath();
            ctx.moveTo(this.timeProgressBar.progress, (this.height));
            ctx.lineTo(this.timeProgressBar.progress, (this.height - 95));
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.closePath();
            /*
            ctx.fillStyle = "red";
            this.timeProgressBar.cueLines.forEach(function(pos){
                ctx.fillRect(pos, (that.height - 95), 1, 95);
            });
            */
        };
        this.drawHiglight = function (pos, intensity) {

            var that = this;
            var ctx = this.ctx;

            var len = 1;
            var width = -len,
                begin = pos - len;

            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.strokeStyle = "rgba(76, 155, 46, .5)"; //convertHex(getColor(that.timeProgressBar.color), 50); //"rgba(76, 155, 46, .5)";
            ctx.fillStyle = "rgba(76, 155, 46, .5)"; //convertHex(getColor(that.timeProgressBar.color), 50); //"rgba(76, 155, 46, .5)";

            for (; width < len; begin++, width++) {
                ctx.moveTo(begin, (this.height));
                ctx.lineTo(begin, (this.height - 95));
                ctx.stroke();
                ctx.beginPath();
                if (width <= 0) {
                    that.timeProgressBar.color += (1 / len);
                } else {
                    that.timeProgressBar.color -= (1 / len);
                }
            }
        };
        this.addExplorer = function (intensity, explodeX, explodeY, options) {
            var exploder = this.getExploder(intensity, explodeX, explodeY, options);
            this.exploders.push(exploder);
        };
        this.addDialogue = function (dialogue) {
            var i = 0,
                randomX = getRandomInt(0, 400),
                randomY = getRandomInt(0, 900),
                moveToX = getRandomInt(0, 400),
                moveToY = getRandomInt(0, 900),
                fontSize = getRandomInt(12, 40);

            if (dialogue.indexOf('from okay') > -1) {
                fontSize = 80;
                randomX = 200;
                randomY = 20;
                moveToX = 100;
                moveToY = 600;
            }

            dialogue.replace('/-/gi',' ').replace(/ *\[[^)]*\] */g, "");

            this.chart.append("text")
                .attr("transform", "translate(" + randomX + "," + randomY + ")")
                .text(dialogue)
                .style("fill", d3.hsl((i = (i + 1) % 360), 1, 0.5))
                .style("opacity", 1)
                .style({
                    'font-size': fontSize + 'px',
                    'font-weight': 'bold'
                })
                .transition()
                .duration(3000)
                .ease(Math.sqrt)
                .style("opacity", 0)
                .attr("transform", "translate(" + moveToX + "," + moveToY + ")")
                .remove();

        };
        this.removeExploder = function (id) {
            var arr = this.exploders;
            var i = arr.length;
            while (i--) {
                if (arr[i] && (arr[i].id === id)) {
                    arr.splice(i, 1);
                }
            }
        };
        this.getExploder = function (strength, x, y, options) {
            return new Particle(strength, x, y, options);
        };
        this.startRendering = function () {
            this.animationId = requestAnimationFrame(this.startRendering.bind(this));
            var that = this;
            this.ctx.save();
            this.ctx.fillStyle = "rgba(0,0,0,.1)";
            this.ctx.fillRect(0, 0, this.width, this.height - 95);
            this.drawTimelinePanel();
            this.timeProgressBar.update(this);
            //start the exploder from any charator circle center randomly
            var chars = that.chart.selectAll(".chars")[0],
                charLen = chars.length;

            //add an exploder if there is data at current time
            this.explodeTime.forEach(function (data, i) {

                if (data.time < (that.timeProgressBar.time)) {
                    var pos = data.time * that.scale;
                    var intesity = 2; //that.timeProgressBar.intensity + 1;
                    var randomChar = getRandomInt(0, charLen - 1);
                    that.addExplorer(intesity, pos, that.height - 100, {
                        time: 2000,
                        color: 'rgb(199, 233, 180)',
                        startX: d3.select(chars[randomChar]).data()[0].x, // FIX me: use d3 filter
                        startY: d3.select(chars[randomChar]).data()[0].y
                    });
                    that.explodeTime.splice(i, 1);
                    forceLayout.alpha(3);
                    that.timeProgressBar.intensity += 0.2;
                    setTimeout(function () {
                        that.drawHiglight(pos, that.timeProgressBar.intensity);
                        that.addDialogue(data.text);
                    }, 2000);
                }
            });

            this.exploders.forEach(function (exploder) {
                exploder.update();
                exploder.draw(that.ctx);
                if (exploder.alpha < 0) {
                    that.removeExploder(exploder.id);
                }
            });
            this.ctx.restore();
        };
        this.init = function (totalDuration, timelineSpeed) {
            this.totalDuration = totalDuration;
            this.progressBar.call(this.timeProgressBar, totalDuration, this.width, timelineSpeed);
            this.scale = this.width / this.totalDuration;
            this.stop = false;
            this.isPlaying = true;
            this.finishPlayed = false;

            this.ctx.fillStyle = "rgb(0,0,0)";//clear canvas
            this.ctx.fillRect(0, 0, this.width, this.height);

            //start rendering
            this.animationId = requestAnimationFrame(this.startRendering.bind(this));
        };

    };

    function render(data, container) {

        var canvasWidth = 1333.33, //$(canvas).width(),
            canvasHeight = 1000, // $(canvas).height();
            paddingleft = 100,
            paddingBottom = 70,
            gridWidth = canvasWidth - paddingleft,
            gridHeight = canvasHeight - paddingBottom;
        var colors = d3.scale.category20b();
        var ci = 0;
        Chart = d3.select(container).append("svg");

        canvas = d3.select(container).append("canvas")[0][0];
        var ctx = canvas.getContext('2d');
        ctx.font = "bold 16px Arial";



        var ground_height = 300;
        canvas.width = canvasWidth;
        canvas.height = gridHeight;
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        Chart.attr("viewBox", "0 0 " + canvasWidth + " " + canvasHeight)
            .attr("preserveAspectRatio", "xMidYMid");

        var totalFilimDuration = (150 * 60 * 1000); //min
        var timelineSpeed = 250; // 100x;

        var canStartMovie = true;
        var isSrtLoaded = false;
        var timeLine;
        var sound;

        function loadSrt(search, cb) {
            $.get('../js/data/pulfic.srt', function (data) {
                var srt = data.replace(/\r\n|\r|\n/g, '\n');

                function strip(s) {
                    return s.replace(/^\s+|\s+$/g, "");
                }

                function toSeconds(t) {
                    var s = 0.0;
                    if (t) {
                        var p = t.split(':');
                        for (i = 0; i < p.length; i++)
                            s = s * 60 + parseFloat(p[i].replace(',', '.'));
                    }
                    return parseInt(s * 1000, 10);
                }
                var subtitles = [],
                    st, n, i, o, t, timeinSec, j;
                srt = strip(srt);
                var srt_ = srt.split('\n\n');
                for (var s in srt_) {
                    st = srt_[s].split('\n');
                    if (st.length >= 2) {
                        n = st[0];
                        i = strip(st[1].split(' --> ')[0]);
                        o = strip(st[1].split(' --> ')[1]);
                        t = st[2];
                        if (st.length > 2) {
                            for (j = 3; j < st.length; j++) {
                                t += '\n' + st[j];
                            }
                        }
                        timeinSec = toSeconds(i);

                        var reg = new RegExp(search, 'ig');

                        var matching = t.match(reg);

                        if (matching) {

                            for (var k = 0; k < matching.length; k++) {
                                subtitles.push({
                                    time: timeinSec,
                                    text: t
                                });
                            }
                        }
                    }
                }
                cb(subtitles);

            });
        }


        var characters = [{
            id: 'one',
            path: './templates/images/g5-pullfic/s.png'
        }, {
            id: 'two',
            path: './templates/images/g5-pullfic/s1.png'
        }, {
            id: 'three',
            path: './templates/images/g5-pullfic/s2.png'
        }];

        function addCharaters() {


            var graph = {
                "nodes": [
                    {
                        "name": "Myriel",
                        "group": 1,
                        "path": '../templates/images/g5-pullfic/s.png'
                    },
                    {
                        "name": "Napoleon",
                        "group": 1,
                        "path": './templates/images/g5-pullfic/s.png'
                    },
                    {
                        "name": "Baptistine",
                        "group": 1,
                        "path": '../templates/images/g5-pullfic/s.png'
                    },
                    {
                        "name": "Magloire",
                        "group": 1,
                        "path": '../templates/images/g5-pullfic/s.png'
                    },
                    {
                        "name": "CountessdeLo",
                        "group": 1,
                        "path": '../templates/images/g5-pullfic/s.png'
                    },
                    {
                        "name": "Geborand",
                        "group": 1,
                        "path": '../templates/images/g5-pullfic/s.png'
                    },
                    {
                        "name": "Champtercier",
                        "group": 1,
                        "path": '../templates/images/g5-pullfic/s.png'
                    },
                    {
                        "name": "Cravatte",
                        "group": 1,
                        "path": '../templates/images/g5-pullfic/s1.png'
                    },
                    {
                        "name": "Count",
                        "group": 1,
                        "path": '../templates/images/g5-pullfic/s2.png'
                    }
  ],
                "links": []
            };

            //add ClipPath Circle
            _util.addClipPathCircle(Chart.selectAll("svg")[0].parentNode, "clipPathCircle", 50);




            forceLayout = d3.layout.force()
                .charge(-300)
                .linkDistance(250)
                .size([canvasWidth / 2, gridHeight / 2]);

            forceLayout
                .nodes(graph.nodes)
                .links(graph.links)
                .start();

            var link = Chart.selectAll(".char-link")
                .data(graph.links)
                .enter().append("line")
                .attr("class", "char-link")
                .style("stroke-width", 1);

            var node = Chart.selectAll(".node")
                .data(graph.nodes)
                .enter().append("g")
                .attr("class", "chars")
                .call(forceLayout.drag);


            node.append("image")
                .attr("width", "100").attr("height", "100")
                .attr("xlink:href", function (d) {
                    return d.path;
                })
                .attr('clip-path', "url(#clipPathCircle)");


            forceLayout.on("tick", function () {
                link.attr("x1", function (d) {
                    return d.source.x;
                })
                    .attr("y1", function (d) {
                        return d.source.y;
                    })
                    .attr("x2", function (d) {
                        return d.target.x;
                    })
                    .attr("y2", function (d) {
                        return d.target.y;
                    });

                node.attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
            });


        }


        function addAudio() {


            var loadingScreen = $('<div class="loadingScreen" />'),
                loader = $('<div class="loader"><div class="spin1 stop" /><div class="spin2 stop"/></div>'),
                play = $('<div class="play_border"><div class="play_button"></div></div>');


            loadingScreen.append(loader);

            $(container).append(loadingScreen);


            function addPlayScreen() {
                if (isSrtLoaded && canStartMovie) {
                    loadingScreen.css('background', '#FFF');
                    loadingScreen.html(play);

                    $(play).on('click', function () {
                        loadingScreen.hide();
                        timeLine.init(totalFilimDuration, timelineSpeed);
                        sound.play();

                    });

                } else {
                    setTimeout(function () {
                        addPlayScreen();
                    }, 100);
                }
            }

            //http://goldfirestudios.com/proj/howlerjs/sounds.mp3
            sound = new audio.Howl({
                urls: ['http://goldfirestudios.com/proj/howlerjs/sounds.mp3', 'http://goldfirestudios.com/proj/howlerjs/sounds.ogg'],
                autoplay: false,
                loop: false,
                volume: 0.5,
                onload: function () {
                    canStartMovie = true;
                    addPlayScreen();
                }
            });

            //for local only
            addPlayScreen();

        }



        var onFinish = function (exploders) {

            var finishScreen = $('<div class="loadingScreen finishScreen" />'),
                restart = $('<div class="play_border restart_button"></div>');
            //finishScreen.append(restart);

            $(container).append(finishScreen);
            $(container).append(restart);

            restart.on('click', function () {
                finishScreen.hide();
                timeLine.init(totalFilimDuration, timelineSpeed);
                timeLine.explodeTime = exploders;
                sound.play();
            });

            finishScreen.fadeIn(2000);

        };



        function initGraph() {

            loadSrt('fuck', function (fuckData) {
                addCharaters(characters);
                timeLine = new TimeLine(canvas, Chart, fuckData);
                timeLine.onFinish = onFinish;
                isSrtLoaded = true;
            });

            addAudio();
        }

        initGraph();
    }

    return render;

});
