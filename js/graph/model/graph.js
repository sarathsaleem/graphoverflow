/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator,document */

define(['dal/index', 'utils/utils'], function (DAL, _utils) {

    "use strict";

    var localStorage = _utils.hasLocalStorage();

    function GraphModel(graph, app) {

        var that = this;

        //default size of a chart
        var canvasWidth = 1333.33,
            canvasHeight = 1000;

        this.app = app;

        this.id = '';
        this.title = '';
        this.isTemplateReady = false;
        this.thumbnail = 'templates/images' + this.id;
        this.description = '';
        this.tags = [];
        this.date = '01/01/2016';
        this.graphCanvas = '.graphCanvas';
        this.infullScreen = false;
        this.grapSpec = graph;

        this.getJsonData = function (cb) {

            /*if (localStorage) {
                var data = localStorage.getItem(that.id);
                if (data) {
                    cb(JSON.parse(data));
                    return;
                }
            }*/

            DAL.stackData.get(this.id, cb);
        };

        this.renderGraph = function (grapData) {

            if (!grapData) {
                console.warn("GO: Cannot load '" + that.id + "' data from data folder");
            }

            //check data error
            //localStorage.setItem(that.id, JSON.stringify(grapData));

            require(['graph/render/' + that.id], function (render) {

                render(grapData, $(that.graphCanvas)[0]);
                $(that.graphCanvas).addClass(that.grapSpec.id);
                if (that.grapSpec.tmpl !== "fullscreen") {
                    that.addFullscreenControls();
                }

            });
        };

        this.addFullscreenControls = function () {

            var fullScreenControl = $('<div class="fullscreenControl"></div>');

            $(that.graphCanvas).append(fullScreenControl);

            fullScreenControl.click(function () {
                that.goFullScreen(that.graphCanvas);
            });

            $(document).keyup(function (event) {
                if (event.keyCode == 27) { //esc
                    that.infullscreen = true;
                    fullScreenControl.click();
                }
            });

        };


        /* dom */
        this.goFullScreen = function (element) {
            var canvas = $('.container .canvas');
            var chart = $(element);

            var elementWidth;
            var elementHeight;

            function onResize() {

                if (!that.infullscreen) {
                    return;
                }

                canvas.width($(window).width());
                canvas.height($(window).height());

                elementWidth = $(window).width() > canvasWidth ? canvasWidth : $(window).width();
                elementHeight = $(window).height() > canvasHeight ? canvasHeight : $(window).height();

                if (elementWidth / 1.3333 >= elementHeight) {
                    elementWidth = elementHeight * 1.3333;
                }
                elementHeight = elementWidth / 1.33333;
                chart.height(elementHeight);
                chart.width(elementWidth);
                chart.css({
                    "margin-top": -(elementHeight / 2) + "px",
                    "margin-left": -(elementWidth / 2) + "px"
                });
            }

            if (!that.infullscreen) {
                that.infullscreen = true;
                $('body').addClass('inFullScreen');
                chart.prop("id", 'fullscreenElement');
                canvas.width($(window).width());
                canvas.height($(window).height());
                $(window).resize(onResize).resize();

            } else {
                $('body').removeClass('inFullScreen');
                chart.removeAttr("id");
                chart.removeAttr('style');
                canvas.removeAttr('style');
                $(window).off('resize', onResize);
                that.infullscreen = false;
            }

        };

        /**
         * @
         *
         *
         *
         */
        this.init = function (data) {

            this.getJsonData(this.renderGraph);

        };

        $.extend(this, graph);

    }

    return GraphModel;

});
