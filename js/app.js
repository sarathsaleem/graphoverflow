/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator */



require.config({
    // baseUrl: './js',
    // urlArgs: "bust=" + (new Date()).getTime(), //prevent cache for testing
    paths: {
        knockout: 'libs/knockout',
        d3: 'libs/d3',
        gui :'libs/dat.gui'
    },
    shim: {
        d3: {
            exports: 'd3'
        },
        'libs/optimer_bold.typeface': {
            deps : ['libs/three']
        },
        'libs/optimer_regular.typeface': {
            deps : ['libs/three']
        },
        'libs/FontUtils': {
            deps : ['libs/three']
        },
        'libs/TextGeometry': {
            deps : ['libs/three','libs/FontUtils']
        }
    }
});

define(function (require, exports, module) {
    "use strict";

    //load libs
    var ko = require('knockout'),
        GraphModel = require('graph/model/graph'),
        Dashboard = require('graph/views/dashboard'),
        graphs = require('graph/model/graph-list'),
        graphsList = graphs.graphList,
        tags = graphs.tags;
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
                graphsList.forEach(function (graph) {
                    if(graph.id == id){
                        list.push(graph);
                    }
                });
                if (list.length) { // fix me : improve
                    return list;
                }
                console.error('cannot find graph with id ' + id + ' in graphlist');
                // give full graph list for dashboard
            } else {
                return graphsList;
            }
        };

        this.loadGraph = function (id) {

            var graphList = this.getGraphList(id);
            if (graphList.length === 0) {


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

            app.dashboard.tags(tags);
            //setTimeout(this.loadGraph.bind(this), 2000);

        };
        this.init = function (){
            this.loadGraph();
            app.dashboard.initGridView();
        };
    }


    var App = new GraphOverflow();

    /**
     * Description
     */

    function initKoBinding() {

        $(function () {
            ko.applyBindings(App.dashboard, $('html ')[0]);
            App.init();
        });


        $('.info-me').on('click', function(){
            $('body').toggleClass('inInfo');
        });

    }
    App.dashboard.init(initKoBinding);

    exports.App = App;

});
