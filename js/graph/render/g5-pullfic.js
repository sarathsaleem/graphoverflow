/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator , clearInterval , setInterval*/
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

    function Particle(x, y, radius, explodeX, explodeY, time, opt) {

        var options = opt || {};

        this.initPos = {
            x: x,
            y: y
        };
        this.pos = {
            x: x,
            y: y
        };
        this.id = Math.random();
        this.radius = radius;
        this.explode = false;
        this.explodeX = explodeX || 100;
        this.explodeY = explodeY || 100;
        this.time = 0;
        this.easing = options.easing || 'easeInQuad';
        this.duration = time || 1000;
        this.alpha = options.alpha | 1;
        this.dirX = 1;
        if (this.pos.x > this.explodeX) {
            this.dirX = -1;
        }
        this.dirY = 1;
        if (this.pos.y > this.explodeY) {
            this.dirY = -1;
        }
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
                var progressX = FX[this.easing](this.time, 0, this.explodeX, this.duration) * this.dirX;
                var progressY = FX[this.easing](this.time, 0, this.explodeY, this.duration) * this.dirY;

                this.pos.x = (this.initPos.x + progressX);
                this.pos.y = (this.initPos.x + progressY);
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
            //cx.globalCompositeOperation = this.compositeOperation;
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


    var getColor = d3.scale.linear().domain([0, 50]).range(['#c7e9b4', "#41b6c4"]);

    var TimeLine = function (canvas, explodes) {
        this.canvas = canvas;
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
            this.intensity = .5;
            this.maxCueValue = 35;
            this.addCue = false;
            this.update = function () {
                if (this.time < this.duration) {
                    var progressX = FX[this.easing || 'linear'](this.time, 0, this.length, this.duration);
                    this.progress = progressX;
                    this.time += 16.67; //1000/60;         
                    if (this.addCue) {
                        this.cueLines += this.intensity;
                    } else  {
                       this.cueLines -= this.intensity;
                    }
                    
                    if(this.cueLines >= this.maxCueValue) {
                        this.addCue = false;
                    }

                    this.cueLines = (this.cueLines <= 0 ? 0 : this.cueLines);
                }
            };
        };
        this.drawTimelinePanel = function () {
            var that = this;
            var ctx = this.ctx;
            ctx.fillStyle = "white";
            ctx.fillRect(0, (this.height - 100), this.width, 5);
            // ctx.fillStyle = "rgba(76, 155, 46, 1)";
            // ctx.fillRect(0, (this.height - 95), this.timeProgressBar.progress, 45);



            ctx.strokeStyle = getColor(that.timeProgressBar.cueLines); //"rgba(76, 155, 46, 1)";
            ctx.fillStyle = getColor(that.timeProgressBar.cueLines); //"rgba(76, 155, 46, 1)";
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
        this.addExplorer = function (intensity, explodeX, explodeY, time) {
            var exploder = this.getExploder(intensity, explodeX, explodeY, time);
            this.exploders.push(exploder);
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
        this.getExploder = function (strength, x, y, time) {
            return new Particle(0, 0, strength, x, y, time);
        };
        this.startRendering = function () {
            var that = this;
            this.ctx.save();
            this.ctx.fillStyle = "rgba(0,0,0,.1)";
            this.ctx.fillRect(0, 0, this.width, this.height - 95);
            this.drawTimelinePanel();
            this.timeProgressBar.update();

            this.explodeTime.forEach(function (time, i) {
                if (time < that.timeProgressBar.time) {
                    var pos = time * that.scale;
                    that.addExplorer(.5, pos, that.height - 100, 2000);
                    that.explodeTime.splice(i, 1);
                    if(that.timeProgressBar.addCue ) {
                        that.timeProgressBar.maxCueValue +=2;
                    } else {
                        that.timeProgressBar.maxCueValue -=.5;
                        that.timeProgressBar.maxCueValue = that.timeProgressBar.maxCueValue < 35 ? 35 : that.timeProgressBar.maxCueValue;
                    }
                    that.timeProgressBar.addCue = true;
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
        this.init = function (totalDuration) {
            this.totalDuration = totalDuration;
            this.progressBar.call(this.timeProgressBar, totalDuration, this.width, 1);
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
        ctx.fillRect(0, 0, 1000, 1000);

        var totalFilimDuration = (1 * 60 * 1e3); //5min
        var explos = [];
        for (var x = 0; x < 25; x++) {
            explos.push(getRandomInt(0, totalFilimDuration));
        }

        var timeLine = new TimeLine(canvas, explos);
        timeLine.init(totalFilimDuration);

        $(canvas).on('click', function () {
            for (var i = 0; i <= 10; i++) {
                timeLine.addExplorer((Math.random() * 2), (Math.random() * canvasWidth), (Math.random() * gridHeight), (Math.random() * 5000));
            }
        });
    }

    return render;

});