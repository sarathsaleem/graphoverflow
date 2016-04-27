/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define,THREE, brackets: true, $, window, navigator , clearInterval , setInterval, d3*/

define(function () {

    "use strict";

    return function (app) {


        var animate = app.animate,
            that = this;


        animate.controls.enabled = false;

        var gTime = Date.now();

        this.isTableLoaded = false;

        this.changeScreen = function (screen) {
            if (this.OnScreenChange && typeof this.OnScreenChange === 'function') {
                this.OnScreenChange(screen);
            }
        };

        this.initScreen = function () {
            this.changeScreen(1);
        };

        this.logTime = function (me, t) {
            var logTime = t || gTime;
            console.log(me + ' : ', Date.now() - logTime);
        };

        this.setCamera = function (screen) {

            animate.controls.reset();

            if (screen === 2) {
                var target = new THREE.Vector3();
                var position = new THREE.Vector3(-2196.9444248900513, -5783.6378311519475, 4047.1373557078664);
                var up = new THREE.Vector3(0.20125934594291095, 0.5091274844898959, 0.8368296602102624);
                animate.controls.resetTo(target, position, up);
            }


        };

        this.setZoom = function () {

        };

        this.onFinshTableAnimation = function () {
            that.isTableLoaded = true;
            animate.controls.enabled = true;
            app.info.switchScreen(1);
        };



    };

});
