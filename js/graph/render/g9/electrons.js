/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, d3, THREE, define, brackets: true, $, window */

define(['libs/three', 'd3'], function (ignore) {
    "use strict";

    //data http://www.periodni.com/electronic_configuration_of_the_elements.html
    //http://www.ptable.com/Static/interactivity-2fcd37b.js


    var Orbitals = function (data) {


        var electronstring = data.electronstring,
            notations =  data.electronstringNotations;

        this.getConfiguration = function () {

            var eConfiguration = {},
                atomicNumbers = Object.keys(electronstring);

            atomicNumbers.forEach(function (num) {
                var eString = electronstring[num],
                    notation = eString.split(' ').shift(),
                    fullString = eString;
                if (notation && notation.indexOf('[') > -1) {
                    fullString = eString.replace(notation, notations[notation]);
                }
                eConfiguration[num] = fullString;
            });

            return eConfiguration;

        };

        this.getLevelConfiguration = function (string) {
            var levelsConfigs = {},
                levelNotatins = ['K','L','M','N','O', 'P', 'Q'],
                levels = string.split(' ');

            levels.forEach(function (level) {
                var spec = level.split(''),
                    num = spec[0],
                    levelSym = levelNotatins[num];
                if (levelsConfigs[levelSym]) {
                    levelsConfigs[levelSym] += Number(spec[2]);
                } else {
                    levelsConfigs[levelSym] = Number(spec[2]);
                }
            });
            return levelsConfigs;
        };



         var full = this.getConfiguration();

        console.log(this.getLevelConfiguration(full['32']))











    };


    return Orbitals;

});
