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


define(['d3', 'utils/utils'], function (d3, _util) {

    "use strict";

    function Particle(x, y, r, explodeX, explodeY, time) {
        this.pos = {
            x: x,
            y: y
        };
        this.vel = {
            x: 0,
            y: 1
        };
        this.radius = r;
        this.drag = 1.01;
        this.explode = false;
        this.gravity = 0.001;
        this.explodeX = explodeX || 100;
        this.explodeY = explodeY || 100;
        this.time = time || 1000;
        this.alpha = 1;
        this.dirX = 1;
        this.life = 1;
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

        this.vel.x = (Math.abs(this.pos.x - this.explodeX) / time);
        this.vel.y = (Math.abs(this.pos.y - this.explodeY) / time);

        this.update = function () {

            if (this.alpha <= 0) {
                return;
            }

            if ((this.pos.x > this.explodeX) && (this.pos.y > this.explodeY)) {
                this.explode = true;
            }

            //this.rotation += this.spin;
            if (this.explode) {
                this.alpha -= 0.03;
                this.exploding();
                return;
            }

            this.vel.x *= this.drag;
            this.vel.y *= this.drag;

            this.vel.y += this.gravity;

            this.pos.x += (this.vel.x * this.dirX);
            this.pos.y += (this.vel.y * this.dirY);

            this.life += 1;
        };
        this.draw = function (cx) {
            if (this.alpha <= 0) return;
            cx.save();
            cx.translate(this.pos.x, this.pos.y);
            cx.globalAlpha = this.alpha;
            cx.globalCompositeOperation = this.compositeOperation;
            cx.strokeStyle = "#ffffff";
            cx.fillStyle = this.color || "rgba(30, 66, 255, 0.55)";
            cx.lineWidth = 0;
            cx.beginPath();
            cx.arc(0, 0, this.radius, 0, Math.PI * 2, true);
            cx.closePath();
            cx.fill();
            cx.restore();
        };
        this.exploding = function () {
            this.explode = true;
            this.vel.x = 0;
            this.vel.y = 0;
            this.radius *= 1.095;
            console.log(this.life, this.pos)

            if (this.alpha < 0) {

            }
        };

    }

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

        var exploders = [],
            animationId, time = 0,
            t = 0;


        function getExploder(strength, pontX, pontY) {
            var exploders = [];
            for (var i = 0; i < strength; i++) {
                var particle = new Particle(0, 0, 2 + Math.random() * 3, pontX, pontY, 1000);
                particle.compositeOperation = 'lighter';
                exploders.push(particle);
            }
            return exploders;
        }


        var start = function () {
            time = new Date().getTime();
            exploders = getExploder(1, 800, 400);
        };

        function loop() {
            ctx.fillStyle = "rgba(0,0,0,0.2)";
            ctx.fillRect(0, 0, canvasWidth, gridHeight);
            draw();
            animationId = requestAnimationFrame(loop);
        }

        function draw() {

            for (var i = 0; i < exploders.length; i++) {
                var particle = exploders[i];
                particle.time += 1;
                particle.update();
                particle.draw(ctx);
            }
        }

        function mouseHandler() {
            /*var m = d3.mouse(canvas);
            var fmx = m[0],
                fmy = m[1];*/
            start();
        }

        $(canvas).on('click', mouseHandler);
        start();
        animationId = requestAnimationFrame(loop);
    }

    return render;

});
