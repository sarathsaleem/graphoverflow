/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator , clearInterval , setInterval, d3*/
var App = {};
define(['utils/utils', '../g9/animate', '../g9/screen', '../g9/dal','../g9/table', '../g9/atom', '../g9/info', 'd3', 'libs/three', 'libs/stats', 'libs/tween'], function (_util, Animate, Screen, Dal, Table, Atom, Info, ignore) {

    "use strict";

    function render(data, canvas) {

        App.data = data;

        App.animate = new Animate(canvas);
        App.screen = new Screen();
        App.dal = new Dal();

        App.table = new Table(App.data);

        App.atom = new Atom(App.data);

        App.info = new Info(App);

        App.animate.renderUpdates = [];


        App.table.subscribe(function(ele,m){
            App.info.addElemntInfo(ele,m);
        });

        var screen = 2;

        if (screen === 1) {
            App.table.addTable(App.animate);
            App.animate.renderUpdates = App.table.renderUpdates;
        } else {
            var atomicNumber = 88;
            App.atom.create(atomicNumber, App.animate.scene);
            App.atom.electrons.bhorModel(atomicNumber, App.animate.scene);
            App.animate.renderUpdates = App.atom.renderUpdates;
        }

        App.animate.setScreenLighting(screen);
        App.info.switchScreen(screen);

        window.App = App;


    }
    return render;

});
