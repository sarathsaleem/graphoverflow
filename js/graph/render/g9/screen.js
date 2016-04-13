/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define,THREE, brackets: true, $, window, navigator , clearInterval , setInterval, d3*/

define(['utils/utils'], function (_util) {

    "use strict";

    return function () {

        this.changeScreen = function (screen) {
            if (this.OnScreenChange && typeof this.OnScreenChange === 'function') {
                this.OnScreenChange(screen);
            }
        };

        this.initScreen = function () {
            this.changeScreen(2);
        };



    };

});
