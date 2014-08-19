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

        function compare(a, b) {
            if (a.time < b.time) {
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

                if (data.l) {
                    if (language[data.l]) {
                        language[data.l] += 1;
                    } else {
                        language[data.l] = 1;
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
        var text = Chart.append("text")
            .attr("transform", "translate(200,200)")
            .text("Start timer");




        var GitHour = function () {
            var that = this;
            this.speed = 200;
            this.speedEvent = gui.add(this, 'speed', 10, 1000);
            this.timer = 0;
            this.count = 0;
            this.data = [];
            this.animationId = 0;
            this.time = 0;
            this.progress = 0;
            this.endTime = 0;
            this.stop = true;
            this.finishPlayed = true;
            this.isPlaying = false;

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
            this.update = function () {
                if (this.time < this.endTime) {
                    this.timer += (16 * this.speed);
                    this.time += (16 * this.speed); //1000/60 * speed;
                } else {
                    this.stop = true;
                    this.finishPlayed = true;
                    if (typeof this.onFinish === 'function') {
                        this.onFinish(this.initialExploders);
                        cancelAnimationFrame(this.animationId);
                    }
                }
            };

            this.render = function () {
                /* that.timer = setInterval(function () {
                    console.log(that.data.arr[that.count].time);
                    that.addAnEvent();
                    that.count++;
                }, timeScale(that.speed));
                */
                this.animationId = requestAnimationFrame(this.render.bind(this));

                var progressTime = new Date(Math.abs(this.time));

                //text.text(progressTime.getHours() + " - " + progressTime.getMinutes() + " - " + progressTime.getSeconds());
                text.text(progressTime);

                this.update.call(this);

                for (var i = 0; i < this.data.arr.length; i++) {
                    var dataTime = this.data.arr[i].time * 1000;

                    if (dataTime < this.time) {

                        //this.addAnEvent();



                        this.data.arr.splice(i, 1);

                    } else {
                        break;
                    }
                }

            };

            this.start = function () {
                that.data = parseGitData(gitData);
                //make initial time as git event time
                var startTime = that.data.arr[0].time * 1000; //add milli sec since I removed it from json
                that.time = startTime;
                that.initTime = startTime;
                Date.prototype.addHours = function (h) {
                    this.setHours(this.getHours() + h);
                    return this;
                };
                that.endTime = Date.parse(new Date(startTime).addHours(1)); //+1 hr

                that.render();
            };
        };

        var GIT = new GitHour();


        GIT.start();

    }

    return render;

});
