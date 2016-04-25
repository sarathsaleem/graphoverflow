/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator , clearInterval , setInterval, d3*/
var App = {};
define(['utils/utils', '../g9/animate', '../g9/screen', '../g9/dal', '../g9/table', '../g9/atom', '../g9/info', 'd3', 'libs/three', 'libs/stats', 'libs/tween'], function (_util, Animate, Screen, Dal, Table, Atom, Info, ignore) {

    "use strict";

    function render(data, canvas) {

        App.animate = new Animate(canvas);

        App.screen = new Screen(App.animate);

        App.data = data;

        App.dal = new Dal();

        App.table = new Table(App);

        App.atom = new Atom(App.data);

        App.info = new Info(App);

        App.animate.renderUpdates = [];

        App.atomicNumber = 38;//test

        App.table.subscribe(function (ele, m) {
            App.info.addElemntInfo(ele, m);
        });
        App.table.subscribeClick(function (aNumber, m) {
            App.atomicNumber = aNumber;
            App.info.showElementInfo(aNumber, m);
        });

        App.table.addTable(App.animate);

        App.screen.OnScreenChange = function (screenNum) {
            if (screenNum === 1) {
                App.table.show();
                App.atom.hide();
                App.animate.renderUpdates = App.table.renderUpdates;
            } else {

                App.table.hide();

                App.atom.create(App.atomicNumber, App.animate.scene);
                App.atom.electrons.bhorModel(App.atomicNumber, App.animate);
                App.atom.show();
                App.animate.renderUpdates = App.atom.renderUpdates;
                App.animate.scene.add(App.atom.stage);
            }

            App.animate.setScreenLighting(screenNum);
            App.info.switchScreen(screenNum);
        };


        window.App = App;

        App.screen.initScreen();


    }
    return render;

});
