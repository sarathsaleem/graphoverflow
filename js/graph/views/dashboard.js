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


        this.init = function (cb) {

            this.loadTemplates(cb);
        };

    }

    return DashBoard;

});
