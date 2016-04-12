/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define,THREE, brackets: true, $, window, navigator , clearInterval , setInterval, d3*/

define(['utils/utils'], function (_util) {

    "use strict";

    return function (app) {

        function rnd(min, max) {
            return (Math.random() * (max - min + 1)) + min;
        }

        this.app = app;
        var that = this;

        this.data = app.data;
        //this.screen = screen;
        var ele = this.ele = app.animate.containerEle;
        var elementInfo,
            infoPanel,
            elementScreen;

        setTimeout(function () {

        }, 1000);

        this.addUi = (function (that) {
            elementInfo = $('<div class="elementInfo"><span class="n"></span><span class="s"></span><span class="num"></span><span class="w"></span><span class="lc"></span></div>');
            ele.append(elementInfo);

            /*var slevels = [
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
            */
            infoPanel = $('<div class="infoPlanel"></div>');

            ele.append(infoPanel);


            var tree = that.data.tree,
                groups = {};

            Object.keys(tree).forEach(function (child) {

                var info = $('<div />').addClass('parent'),
                    parentName = $('<div class="parentName" />').text(child);
                info.append(parentName);
                Object.keys(tree[child]).forEach(function (key) {
                    var keys = $('<div />').addClass('childs').attr('group-name', key.replace(/ /g, '-').toLowerCase()).text(key);
                    info.append(keys);

                    groups[key.replace(/ /g, '-').toLowerCase()] = tree[child][key];
                });
                infoPanel.append(info);
            });

            $('.parent .childs').on('mouseover', function () {
                that.highlghtGroup(groups[$(this).attr('group-name')]);
            });
            $('.parent .childs').on('mouseout', function () {
                that.highlghtGroup(0);
            });

        }(this));

        this.highlghtGroup = function (nums) {

            if (!nums) {
                this.app.table.higlightElemnts(0);
                return;
            }

            var aNumbers = [];

            if (nums[0] === 'G') {

                var elements = this.data.elements;
                Object.keys(elements).forEach(function (num) {
                    if (nums[1] === elements[num][4]) {
                        aNumbers.push(Number(num));
                    }
                });

            } else {
                aNumbers = nums;
            }

            this.app.table.higlightElemnts(aNumbers);


        };

        this.addElemntInfo = function (aNumber, mouse) {

            if (aNumber) {

                var eConfiguration = app.atom.electrons.getConfiguration(),
                    levelConfig = app.atom.electrons.getLevelConfiguration(eConfiguration[aNumber]);
                levelConfig = Object.keys(levelConfig).map(function (l) {
                    return levelConfig[l];
                });


                var element = this.data.elements[aNumber];
                elementInfo.find('.n').text(element[1]);
                elementInfo.find('.s').text(element[0]);
                elementInfo.find('.w').text(element[2]);
                elementInfo.find('.num').text(aNumber);
                elementInfo.find('.lc').html(levelConfig.join('</br>'));

                var x = mouse.cx,
                    y = mouse.cy,
                    sx = ele[0].offsetWidth,
                    sy = ele[0].offsetHeight;

                x = x + 250 > sx ? x - 250 : x + 50;
                y = y + 250 > sy ? y - 250 : y + 50;

                elementInfo.css({
                    zIndex: 30,
                    opacity: 1,
                    "transform": "translate3d(" + x + "px, " + y + "px, 0px)"
                });

            } else {
                elementInfo.css({
                    opacity: 0,
                    zIndex: 0
                });
            }

        };

        this.switchScreen = function (screen) {

            var infoPanel = $('.infoPlanel');
            if (screen === 1) {
                infoPanel.fadeIn();
                this.ele.css('background','#a90329');
            } else {
                 this.ele.css('background','#a90329');
                 infoPanel.fadeOut();
                 this.addElemntInfo(0);
                setTimeout(function(){
                    that.ele.css('transition','background ease-in 2s');
                    that.ele.css('background','#000');
                },10);
            }

        };

        this.addElemntPanel = function (aNumnber) {

            elementScreen =  $('<div class="elementScreen"><div class="leftArr"></div><div class="rightArr"></div><div class="backToScreen"></div>"</div>');

        };


    };

});
