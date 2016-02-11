/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define,THREE, brackets: true, $, window, navigator , clearInterval , setInterval, d3*/

define(['utils/utils'], function (_util) {

    "use strict";

    return function (app) {

        function rnd(min, max) {
            return (Math.random() * (max - min + 1)) + min;
        }
        this.data = app.data;
        //this.screen = screen;
        var ele = app.animate.containerEle;
        var elemntInfo;
        this.addUi = (function () {
            elemntInfo = $('<div class="elementInfo"><span class="n"></span><span class="s"></span><span class="num"></span><span class="w"></span><span class="lc"></span></div>');
            ele.append(elemntInfo);

        }());

        this.addElemntInfo = function (aNumber, mouse) {

            if (aNumber) {

                var eConfiguration = app.atom.electrons.getConfiguration(),
                    levelConfig = app.atom.electrons.getLevelConfiguration(eConfiguration[aNumber]);
                levelConfig = Object.keys(levelConfig).map(function(l){
                    return levelConfig[l];
                });


                var element = this.data.elements[aNumber];
                elemntInfo.find('.n').text(element[1]);
                elemntInfo.find('.s').text(element[0]);
                elemntInfo.find('.w').text(element[2]);
                elemntInfo.find('.num').text(aNumber);
                elemntInfo.find('.lc').html(levelConfig.join('</br>'));


                elemntInfo.css({zIndex : 30, opacity:1, left: mouse.cx+100+'px', top: mouse.cy+100+'px'});
            } else {
                elemntInfo.css({opacity:0, zIndex: 0});
            }
        };


    };

});
