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
        var elemntInfo,
            infoPanel;
        this.addUi = (function () {
            elemntInfo = $('<div class="elementInfo"><span class="n"></span><span class="s"></span><span class="num"></span><span class="w"></span><span class="lc"></span></div>');
            ele.append(elemntInfo);

            var slevels = [
                '<div class="1s"><span>1s</span><div class="box"></div></div>'
            ];

            var levels = '<div> \
                            <div class="levels K">' + slevels[0] + '</div> \
                            <div class="levels L"></div> \
                            <div class="levels M"></div> \
                            <div class="levels N"></div> \
                            <div class="levels 0"></div> \
                            <div class="levels P"></div> \
                            <div class="levels Q"></div> \
                        </div>';

            infoPanel = $('<div class="infoPlanel">' + levels + '</div>');

            ele.append(infoPanel);

        }());

        this.addElemntInfo = function (aNumber, mouse) {

            if (aNumber) {

                var eConfiguration = app.atom.electrons.getConfiguration(),
                    levelConfig = app.atom.electrons.getLevelConfiguration(eConfiguration[aNumber]);
                levelConfig = Object.keys(levelConfig).map(function (l) {
                    return levelConfig[l];
                });


                var element = this.data.elements[aNumber];
                elemntInfo.find('.n').text(element[1]);
                elemntInfo.find('.s').text(element[0]);
                elemntInfo.find('.w').text(element[2]);
                elemntInfo.find('.num').text(aNumber);
                elemntInfo.find('.lc').html(levelConfig.join('</br>'));

                var x = mouse.cx,
                    y = mouse.cy,
                    sx = ele[0].offsetWidth,
                    sy = ele[0].offsetHeight;

                x = x + 250 > sx ? x - 250 : x + 50;
                y = y + 250 > sy ? y - 250 : y + 50;

                elemntInfo.css({
                    zIndex: 30,
                    opacity: 1,
                    "transform": "translate3d(" + x + "px, " + y + "px, 0px)"
                });

            } else {
                elemntInfo.css({
                    opacity: 0,
                    zIndex: 0
                });
            }


            this.addOrbitalInfo(aNumber);
        };


        this.addOrbitalInfo = function (aNumber) {
            var eConfiguration = app.atom.electrons.getConfiguration();

            console.log(eConfiguration[aNumber])
            //infoPanel.text(eConfiguration[aNumber])
        };


    };

});
