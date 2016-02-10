/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define,THREE, brackets: true, $, window, navigator , clearInterval , setInterval, d3*/

define(['utils/utils'], function (_util) {

    "use strict";

    return function (data, screen) {

        function rnd(min, max) {
            return (Math.random() * (max - min + 1)) + min;
        }
        this.data = data;
        //this.screen = screen;
        var ele = screen.containerEle;
        var elemntInfo;
        this.addUi = (function () {
            elemntInfo = $('<div class="elementInfo"><span class="n"></span><span class="s"></span><span class="num"></span><span class="w"></span></div>');
            ele.append(elemntInfo);

        }());

        this.addElemntInfo = function (aNumber) {

            if (aNumber) {

                var element = this.data.elements[aNumber];
                elemntInfo.find('.n').text(element[1]);
                elemntInfo.find('.s').text(element[0]);
                elemntInfo.find('.w').text(element[2]);
                elemntInfo.find('.num').text(aNumber);
            }
        }


    };

});
