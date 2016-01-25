/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator , clearInterval , setInterval, d3*/
var App = {};
define(['utils/utils', '../g9/animate', '../g9/screen', '../g9/dal', '../g9/atom', '../g9/electrons', 'd3', 'libs/three', 'libs/stats'], function (_util, Animate, Screen, Dal, Atom, Electrons, ignore) {

    "use strict";

    function render(data, canvas) {

        App.data = data;

        App.animate = new Animate(canvas);
        App.screen = new Screen();
        App.dal = new Dal();

        App.atom = new Atom();
        App.atom.electrons = new Electrons(App.data);

        App.atom.create(10, App.animate.scene);
        App.atom.electrons.getConfiguration(10);

        App.animate.renderUpdates = App.animate.renderUpdates.concat(App.atom.renderUpdates);


    }
    return render;

});
