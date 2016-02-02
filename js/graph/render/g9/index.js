/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator , clearInterval , setInterval, d3*/
var App = {};
define(['utils/utils', '../g9/animate', '../g9/screen', '../g9/dal','../g9/table', '../g9/atom', 'd3', 'libs/three', 'libs/stats'], function (_util, Animate, Screen, Dal, Table, Atom, ignore) {

    "use strict";

    function render(data, canvas) {

        App.data = data;

        App.animate = new Animate(canvas);
        App.screen = new Screen();
        App.dal = new Dal();

        App.table = new Table(App.data);

        App.atom = new Atom(App.data);

        App.animate.renderUpdates = App.animate.renderUpdates.concat(App.atom.renderUpdates , App.table.renderUpdates);


        var screen = 0;
        //screen atom
        if (screen) {
            var atomicNumber = 3;
            App.atom.create(atomicNumber, App.animate.scene);
            App.atom.electrons.bhorModel(atomicNumber, App.animate.scene);
        } else {

            App.table.addTable(App.animate);

        }





    }
    return render;

});
