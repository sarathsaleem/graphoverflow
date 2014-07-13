/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator */

define(['knockout'], function (ko) {
    "use strict";

    function DashBoard(app) {

        this.app = app;


        var that = this;

        this.layouts = ko.observableArray();
        this.graphs = ko.observableArray().extend({
            notify: 'always'
        });
        this.tags = ko.observableArray().extend({
            notify: 'always'
        });

        this.page = ko.observable('home');

        this.insideGraphs = window.location.pathname.indexOf('/graphs/') > -1 ? true : false;

        this.templatePath = this.insideGraphs ? '../js/graph/views/templ/' : './js/graph/views/templ/';
        this.templates = ['sidebar'];

        this.currentGraph = ko.observable();


        this.addGraph = function (graph) {

            //add each graph object to layout graph array
            this.graphs.push({
                id: graph.id,
                title: graph.title,
                description: graph.description,
                thumbnail: graph.thumbnail,
                link: graph.htmlTitle,
                tags: graph.tags.join(' '),
                show: function () {

                    // set this as current graph
                    that.currentGraph(this);

                    //change to graph detail page
                    that.page('graph');

                    //render current graph
                    graph.init(arguments);

                    //load graph static desc
                    //$('#graphContent').load('../templates/' + graph.id + '.html');
                    //added in grunt
                }
            });
        };

        this.showGraph = function (id) {

            var graph;
            this.graphs().some(function (gs) {
                if (gs.id === id) {
                    graph = gs;
                    return true;
                }
            });
            if (graph) {
                graph.show.call(graph);
            } else {
                this.goHome();
            }
        };

        this.goHome = function () {
            that.page('home');
            //parent.location.hash = "home";
            //window.location.href.replace(/#.*/, '');
            //return false;
        };

        /**
         *@public : Load all template files
         * has to move , can be rendered in grunt
         */
        this.loadTemplates = function (cb) {
            var that = this;
            this.templates.forEach(function (name, i) {

                var tempL = $('<script id="' + name + '" type="text/html"></script>');

                tempL.load(that.templatePath + name + '.html', function () {

                    if (i === that.templates.length - 1) {
                        //init KO binding after template loading
                        cb();

                    }

                });
                $('body').append(tempL);
            });

        };

        this.initGridView = function () {
            if(!window.Isotope) {
                return;
            }
            $.bridget('isotope', Isotope);
            $('#grapsList').isotope({
                filter: '*',
                itemSelector: '.graplist-item',
                animationOptions: {
                    duration: 5000,
                    easing: 'easeInOutQuad',
                    queue: false
                }
            });
            $('#tagList a:first').addClass('selected');
            $('#tagList a').on('click', function () {

                $('#tagList a').removeClass('selected');
                $(this).addClass('selected');

                var filter = $(this).attr('filter');
                filter = filter === 'all' ? '*' : '.' + filter;
                $('#grapsList').isotope({
                    filter: filter
                });
            });

        };


        this.init = function (cb) {

            this.loadTemplates(cb);
        };

    }

    return DashBoard;

});
