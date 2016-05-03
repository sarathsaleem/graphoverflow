/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator , clearInterval , setInterval, d3*/
var App = {};
define(['utils/utils', '../g9/animate', '../g9/screen', '../g9/dal', '../g9/table', '../g9/atom', '../g9/info', 'd3', 'libs/three', 'libs/stats', 'libs/tween'], function (_util, Animate, Screen, Dal, Table, Atom, Info, ignore) {

    "use strict";

    function render(data, canvas) {

        App.animate = new Animate(canvas);

        App.screen = new Screen(App);

        App.data = data;

        App.dal = new Dal();

        App.table = new Table(App);

        App.atom = new Atom(App);

        App.info = new Info(App);

        App.animate.renderUpdates = [];

        App.atomicNumber = 38; //test
        App.atomicConfig = null;

        App.table.subscribe(function (ele, m) {
            if (App.screen.isTableLoaded) {
                App.info.addElemntInfo(ele, m);
            }
        });
        App.table.subscribeClick(function (aNumber) {
            if (App.screen.isTableLoaded) {
                App.atomicNumber = aNumber;
                App.info.showElementInfo(App.atomicNumber);
            }
        });

        App.table.addTable(App.animate);
        App.table.hide();
        App.atom.hide();
        App.info.hideAll();

        App.setTableScreen = function () {
            App.info.switchScreen(1);
            App.screen.setCamera(1);
            if (App.screen.isTableLoaded) {
                App.table.show();
            } else {
                App.table.stage.visible = true;
                App.table.stage.position.z = 0;
            }
            App.atom.hide();
            App.animate.renderUpdates = App.table.renderUpdates;
        };


        App.setAtomScreen = function () {
            App.table.hide();
            App.info.switchScreen(2);
            App.atom.create(App.atomicNumber, App.animate.scene);
            App.atom.electrons.bhorModel(App.atomicNumber, App);
            App.atom.show();
            App.screen.setCamera(2);
            App.screen.setZoom(App.atomicNumber);
            App.animate.renderUpdates = App.atom.renderUpdates;
            App.animate.scene.add(App.atom.stage);
        };

        App.screen.OnScreenChange = function (screenNum) {
            if (screenNum === 1) {
                App.setTableScreen();
            } else {
                App.setAtomScreen();
            }
            App.animate.setScreenLighting(screenNum);
        };


        window.App = App;

        setTimeout(function () {
            App.info.loadingScreen.remove();
            App.screen.initScreen();
            App.table.startTableAniamtion(App.screen.onFinshTableAnimation);
        },10);

    }
    return render;

});
