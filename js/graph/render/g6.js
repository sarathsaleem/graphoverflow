/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require,d3, define, brackets: true, $, window, clearTimeout , dat, clearInterval , setInterval*/
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


define(['utils/utils', 'd3', 'gui'], function (_util, ignore) {

    "use strict";

    function render(gitData, canvas) {



        var canvasWidth = 1333.33, //$(canvas).width(),
            canvasHeight = 1000; // $(canvas).height();

        var language = {};
        var timeScale = d3.scale.linear()
            .domain([60, 1000])
            .range([1000, 17]);


        function compare(a, b) {
            if (Date.parse(a.time) < Date.parse(b.time)) {
                return -1;
            }
            return 1;
        }
        gitData.sort(compare);

        function rnd(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }


        function parseGitData(dataArr) {
            dataArr.forEach(function (data) {

                if (data.language) {
                    if (language[data.language]) {
                        language[data.language] += 1;
                    } else {
                        language[data.language] = 1;
                    }
                }

            });
            return {
                arr: gitData,
                language: language
            };
        }
        var gui = new dat.GUI({
            autoPlace: false
        });
        canvas.appendChild(gui.domElement);


        var Chart = d3.select(canvas).append("svg");
        Chart.attr("viewBox", "0 0 " + canvasWidth + " " + canvasHeight)
            .attr("preserveAspectRatio", "xMidYMid");
        var getColor = d3.scale.linear().domain([0, 100]).range(["#e5f5e0", "#0F772E"]);









        var GitHour = function (duration) {
            var that = this;
            this.speed = 600;
            this.speedEvent = gui.add(this, 'speed', 60, 1000);
            this.timer = 0;
            this.count = 0;
            this.data = [];
            this.animationId = 0;
            this.time = 0;
            this.progress = 0;
            this.duration = duration || (4 * 1000);
            this.cueLines = 0;
            this.intensity = 0;
            this.color = 0;
            this.stop = true;
            this.finishPlayed = true;

            this.addAnEvent = function () {
                var moveToX = rnd(0, 1000),
                    moveToY = rnd(0, 1000);
                Chart.append('circle')
                    .attr('class', 'day')
                    .attr("r", function (d) {
                        return rnd(10, 70);
                    })
                    .style("fill", function () {
                        return getColor(rnd(0, 100));
                    })
                    .transition().duration(500).ease("easeIn")
                    .attr("transform", function (d, i) {
                        return "translate(" + moveToX + "," + moveToY + ")";
                    }).remove();


            };
            this.update = function (timeline) {
                if (this.time < this.duration) {
                    this.timer += (16.67 * this.speed);
                    this.time += (16.67 * this.speed); //1000/60 * speed;
                } else {
                    this.stop = true;
                    this.finishPlayed = true;
                    if (typeof this.onFinish === 'function') {
                        this.onFinish(this.initialExploders);
                        cancelAnimationFrame(this.animationId);
                    }
                }
            };

            this.render = function (progressBar) {
                /* that.timer = setInterval(function () {
                    console.log(that.data.arr[that.count].time);
                    that.addAnEvent();
                    that.count++;
                }, timeScale(that.speed));
                */
                this.animationId = requestAnimationFrame(this.render.bind(this));
                console.log(this.timer)
                this.update.call(this);

                for (var i = 0; i < this.data.arr.length; i++) {
                    var dataTime = Date.parse(this.data.arr[i].time);

                    if (dataTime < this.time) {

                        this.addAnEvent();

                        this.data.arr.splice(i, 1);

                    } else {
                        break;
                    }
                }

            };

            this.start = function () {
                that.data = parseGitData(gitData);
                //make initial time as git event time
                that.time = Date.parse(that.data.arr[0].time);
                that.initTime = Date.parse(that.data.arr[0].time);
                that.duration = Date.parse(that.data.arr[0].time) + (60 * 1000 * 1000); //+1 hr

                that.render();
            };
        };

        var GIT = new GitHour();


        GIT.start();

    }

    return render;

});
