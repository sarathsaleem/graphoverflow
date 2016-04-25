/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define,THREE, brackets: true, $, window, navigator , clearInterval , setInterval, d3*/

define(function () {

    "use strict";

    return function (animate) {

        var camera = animate.camera;

        var gTime = Date.now();

        this.changeScreen = function (screen) {
            if (this.OnScreenChange && typeof this.OnScreenChange === 'function') {
                this.OnScreenChange(screen);
            }
            this.setCamera(1);
        };

        this.initScreen = function () {
            this.changeScreen(2);
        };

        this.logTime = function (me, t) {
            var logTime = t || gTime;
            console.log(me +' : ', Date.now() - logTime);
        };

        this.setCamera = function (screen) {

           animate.resetControls();

        };



    };

});
