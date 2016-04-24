/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 , multistr: true */
/*global require, define,THREE, brackets: true, $, window, navigator , clearInterval , setTimeout, d3*/

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
            elementInfoWrapper,
            elementScreen,
            inShowScreen = false;

        this.addUi = (function (that) {
            var htmlTmpl = ' \
                     <div class="elementInfo"> \
                        <p class="aNumber-w"> \
                            <span class="label">Atomic number :</span> \
                            <span class="prop num"></span> \
                        </p> \
                        <p class="aName-w"> \
                            <span class="label">Name :</span> \
                            <span class="prop n"></span> \
                        </p> \
                        <p class="aSymbol-w"> \
                            <span class="label">Symbol :</span> \
                            <span class="prop s"></span> \
                         </p> \
                        <p class="aWeight-w"> \
                            <span class="label">Atomic weight :</span> \
                            <span class="prop w"></span> \
                        </p> \
                        <p class="eConfig"> \
                            <span class="label">Electronic configuration</span>  \
                            <span class="prop lc"></span> \
                        </p> \
                        <div class="close-icon"></div> \
                        <div class="goDetail-icon"><span>Explore atom</span></div> \
                    </div>';
            elementInfo = $(htmlTmpl);
            ele.append(elementInfo);



            var levels = '<div class="levelsPath"> \
                            <div class="levels K"></div> \
                            <div class="levels L"></div> \
                            <div class="levels M"></div> \
                            <div class="levels N"></div> \
                            <div class="levels O"></div> \
                            <div class="levels P"></div> \
                            <div class="levels Q"></div> \
                        </div>';

            var levelsPanel = $(levels);
            elementInfo.find('.eConfig').append(levelsPanel);


            infoPanel = $('<div class="infoPlanel"></div>');
            elementInfoWrapper = $('<div class="elementInfoWrapper"></div>');
            ele.append(elementInfoWrapper);
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

            $(elementInfo).find('.close-icon').on('click', function () {
                $(elementInfo).removeClass('active');
                inShowScreen = false;
                that.addElemntInfo(0);
                elementInfoWrapper.hide();
            });

            $(elementInfo).find('.goDetail-icon').on('click', function () {
                inShowScreen = false;
                that.addElemntInfo(0);
                elementInfoWrapper.hide();
                app.screen.changeScreen(2);
                $(elementInfo).addClass('inScreen').css({
                    zIndex: 0,
                    opacity: 1,
                    "transform": "translate3d(0,0,0)"
                });
            });


            var eleInfoCntrls = $('<div class="eleInfo leftArr"></div><div class="eleInfo rightArr"></div><div class="eleInfo  backToScreen"></div><div class="eleInfo showLines  onoffswitch"><input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch" checked><label class="onoffswitch-label" for="myonoffswitch"></label></div>');

            ele.append(eleInfoCntrls);

            var backToScreenOne = $('<div class="close-icon clsoeAtomScreen"></div>');
            ele.append(backToScreenOne);
            $(backToScreenOne).on('click', function () {
                inShowScreen = false;
                that.addElemntInfo(0);
                elementInfoWrapper.hide();
                app.screen.changeScreen(1);
                $(elementInfo).removeClass('active').removeClass('inScreen');
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

            if (inShowScreen) {
                return;
            }

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

        this.showElementInfo = function (aNumber, mouse) {

            var eConfiguration = app.atom.electrons.getConfiguration(),
                levelSplitConfig = app.atom.electrons.getLevelSplitConfiguration(eConfiguration[aNumber]);

            elementInfo.find('.levels').hide();
            Object.keys(levelSplitConfig).forEach(function (level) {
                elementInfo.find('.'+level).text(levelSplitConfig[level].join().split(',').join(', ')).show();
            });


            elementInfo.addClass('active').css({
                zIndex: 30,
                opacity: 1,
                "transform": "translate3d(-50%, 50%, 0)"
            });
            elementInfoWrapper.show();
            inShowScreen = true;
        };

        this.switchScreen = function (screen) {

            var infoPanel = $('.infoPlanel');

            if (screen === 1) {
                infoPanel.fadeIn();
                $('.eleInfo').hide();
                ele.addClass('tableScreen').removeClass('atomScreen');

            } else {
                infoPanel.fadeOut();
                this.addElemntInfo(0);
                $('.eleInfo').show(1000);
                ele.removeClass('tableScreen').addClass('atomScreen');
            }

        };


    };

});
