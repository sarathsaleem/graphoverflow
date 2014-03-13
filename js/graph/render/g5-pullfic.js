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


define(['d3', 'utils/utils', 'libs/easing'], function (d3, _util, FX) {

    "use strict";

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
        this.explodeTime = explodes;
        this.exploders = [];
        this.animateId = 0;
        this.currentPos = 0;
        this.totalDuration = 0;
        this.interval = 1000 / 60;
        this.isPlaying = false;
        this.scale = 0; //totalDuration/this.width
        this.pause = false;
        this.stop = true;
        this.updateAnimation = function () {
            if (this.time < this.duration) {
                var progressX = FX[this.easing || 'linear'](this.time, 0, this.explodeX, this.duration) * this.dirX;
                this.pos.x = (this.initPos.x + progressX);
                this.time += 16.67; //1000/60;
            } else {

            }
        };
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
            this.update = function () {
                if (this.time < this.duration) {
                    var progressX = FX[this.easing || 'linear'](this.time, 0, this.length, this.duration);
                    this.progress = progressX;
                    this.time += (16.67 * this.speed); //1000/60 * speed;      
                    this.intensity = (this.intensity <= 0) ? 0 : (this.intensity -= 0.005);
                    this.color = (this.color <= 0) ? 0 : (this.color -= 0.005);
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
            randomY = getRandomInt(0, 500),
            moveToX = getRandomInt(0, 400),
            moveToY = getRandomInt(0, 500),
            fontSize = getRandomInt(8, 20);

            this.chart.append("text")
                .attr("transform", "translate(" + randomX + "," + randomY + ")")
                .text(dialogue)
                .style("fill", d3.hsl((i = (i + 1) % 360), 1, .5))
                .style("opacity", 1)
                .style({                    
                    'font-size': fontSize+'px',
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
            var that = this;
            this.ctx.save();
            this.ctx.fillStyle = "rgba(0,0,0,.1)";
            this.ctx.fillRect(0, 0, this.width, this.height - 95);
            this.drawTimelinePanel();
            this.timeProgressBar.update();

            //add an exploder if there is data at current time
            this.explodeTime.forEach(function (data, i) {
                if (data.time < (that.timeProgressBar.time)) {
                    var pos = data.time * that.scale;
                    var intesity = 2; //that.timeProgressBar.intensity + 1;                    
                    that.addExplorer(intesity, pos, that.height - 100, {
                        time: 2000,
                        color: 'rgb(199, 233, 180)',
                        startX: getRandomInt(0, 900),
                        startY: 100
                    });
                    that.explodeTime.splice(i, 1);
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
            this.animationId = requestAnimationFrame(this.startRendering.bind(this));
        };
        this.init = function (totalDuration, timelineSpeed) {
            this.totalDuration = totalDuration;
            this.progressBar.call(this.timeProgressBar, totalDuration, this.width, timelineSpeed);
            this.scale = this.width / this.totalDuration;
            this.startRendering();
            this.play = true;
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
        var Chart = d3.select(container).append("svg");

        var canvas = d3.select(container).append("canvas")[0][0],
            ctx = canvas.getContext('2d');
        ctx.font = "bold 16px Arial";


        var ground_height = 300;
        canvas.width = canvasWidth;
        canvas.height = gridHeight;
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        var totalFilimDuration = (150 * 60 * 1000); //min
        var timelineSpeed = 150; // 100x;


        function loadSrt(search, cb) {
            $.get('js/data/pulfic.srt', function (data) {
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



        function initGraph() {
            loadSrt('fuck', function (fuckData) {
                var timeLine = new TimeLine(canvas, Chart, fuckData);
                timeLine.init(totalFilimDuration, timelineSpeed);

            });
        }

        initGraph();
    }

    return render;

});