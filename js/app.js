/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator */

require.config({
    baseUrl: './js',
    urlArgs: "bust=" + (new Date()).getTime(), //prevent cache for testing
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
        Dashboard = require('graph/views/dashboard');

    function GraphOverflow() {

        var app = this;

        this.dashboard = new Dashboard(app);

        //register all graphs in this array with addgraph
        var graphs = [];

        this.getGraphsList = function () {
            var list = [],
                modelPath = 'graph/model/';
            graphs.forEach(function (name) {
                list.push(modelPath + name);
            });
            return list;
        };

        /**
         * Add graph model to App
         * @public
         * @param {String}{Array} names
         *
         *
         */
        this.addGraph = function (names) {

            if (typeof names === 'string') {
                names = names.split(',');
            }
            names.forEach(function (name) {
                graphs.push(name);

            });

            //load all graph
            this.loadGraph();
        };

        this.loadGraph = function () {

            var graphList = this.getGraphsList();

            graphList.forEach(function (grapgModel) {

                require([grapgModel], function () {
                    var graphs = Array.prototype.slice.call(arguments);
                    //add all graph to dashboard
                    graphs.forEach(function (graphModel) {
                        var graph = new GraphModel(graphModel, app);
                        app.dashboard.addGraph(graph);
                    });
                }, function (err) {
                    //The errback, error callback
                    //The error has a list of modules that failed
                    var failedId = err.requireModules && err.requireModules[0];
                    console.error("GO: Cannot load a graph with name " + failedId);
                });

            });
        };
    }




    var App = new GraphOverflow();

    //add all graphs
    App.addGraph(['g1','g2','g3','g4']);

    function initKoBinding() {
        $(function () {
            ko.applyBindings(App.dashboard, $('html')[0]);
        });
    }

    App.dashboard.init(initKoBinding);

});
