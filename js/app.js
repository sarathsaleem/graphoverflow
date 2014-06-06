/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator */

require.config({
   // baseUrl: './js',
   // urlArgs: "bust=" + (new Date()).getTime(), //prevent cache for testing
    paths: {
        knockout: 'libs/knockout',
        d3: 'libs/d3',
        jquery: 'libs/jquery'
    },
    shim: {
        d3: {
            exports: 'd3'
        }
    }
});

define(function (require, exports, module) {
    "use strict";

    //load libs
    var $ = require('jquery'),
        ko = require('knockout'),
        d3 = require('d3'),
        GraphModel = require('graph/model/graph'),
        Dashboard = require('graph/views/dashboard'),
        graphsList = require('graph/model/graph-list');
    /**
     * Description
     */

    function GraphOverflow() {

        var app = this;

        this.dashboard = new Dashboard(app);

        //register all graphs in this array with addgraph
        var graphs = [];

        this.modelPath = 'graph/model/graph-list';

        this.getGraphList = function (id) {
            var list = [];
            if (id) {
                if (graphsList[id]) {
                    list.push(graphsList[id]);
                    return list;
                }
                console.error('cannot find graph with id' + id + ' in graphlist');
                // give full graph list for dashboard
            } else {

                Object.keys(graphsList).forEach(function (id) {
                    list.push(graphsList[id]);
                });
                return list;
            }
        };

        this.loadGraph = function (id) {

            var graphList = this.getGraphList(id);
            if(graphList.length === 0) {


            }

            graphList.forEach(function (graphModel) {

                var graph = new GraphModel(graphModel, app);
                app.dashboard.addGraph(graph);

            }, function (err) {
                //The errback, error callback
                //The error has a list of modules that failed
                var failedId = err.requireModules && err.requireModules[0];
                console.error("GO: Cannot load a graph with name " + failedId);
            });

            //setTimeout(this.loadGraph.bind(this), 2000);

        };
    }


    var App = new GraphOverflow();

    /**
     * Description
     */

    function initKoBinding() {
        $(function () {
            ko.applyBindings(App.dashboard, $('html ')[0]);
            App.loadGraph();
        });

    }

    App.dashboard.init(initKoBinding);

    exports.App = App;

});
