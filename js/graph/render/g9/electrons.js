/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, d3, THREE, define, brackets: true, $, window */

define(['libs/three', 'd3'], function (ignore) {
    "use strict";

    //data http://www.periodni.com/electronic_configuration_of_the_elements.html
    //http://www.ptable.com/Static/interactivity-2fcd37b.js


    var Orbitals = function (data, s) {

        this.scene = s;
        var that = this;
        var electronstring = data.electronstring,
            notations = data.electronstringNotations;

        var electronsUi = {};
        this.electronsPos = {};

        /**
         *
         *
         */
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

        /**
         *
         *
         */
        this.getLevelConfiguration = function (string) {
            var levelsConfigs = {},
                levelNotatins = [null, 'K', 'L', 'M', 'N', 'O', 'P', 'Q'], // start from one
                levels = string.split(' ');

            levels.forEach(function (level) {
                var spec = level.split(/[a-z]/),
                    num = spec[0],
                    levelSym = levelNotatins[num];
                if (levelsConfigs[levelSym]) {
                    levelsConfigs[levelSym] += Number(spec[1]);
                } else {
                    levelsConfigs[levelSym] = Number(spec[1]);
                }
            });
            return levelsConfigs;
        };


        /**
         *
         *
         */
        this.getSpherePositions = function (steps, radius) {

            var x = 0,
                y = 0,
                z = 0,
                points = [];

            // Angle is given by Degree Value
            var arcs = (2 * Math.PI) / steps;
            var alpha = 0;

            for (var i = 0; i < steps; i++) {

                var X = x + (radius * Math.cos(alpha));
                var Y = y + (radius * Math.sin(alpha));
                var Z = z + (radius * Math.cos(alpha));
                var position = {
                    x: X,
                    y: Y,
                    z: Z
                };

                points.push(position);

                alpha += arcs;
            }
            return points;

        };

        var geo = new THREE.SphereGeometry(this.protonRadius, 20, 20);

        var material = new THREE.MeshLambertMaterial({
            color: '#00ff1d'
        });

        this.ui_electrons = function (level, positions, scene) {

            electronsUi[level] = [];

            for (var i = 0; i < positions.length; i++) {

                var sphere = new THREE.Mesh(geo, material);

                var vec = new THREE.Vector3(positions[i].x, positions[i].y, positions[i].z);

                sphere.position.add(vec);
                electronsUi[level].push(sphere);
                scene.add(sphere);
            }
        };

        var clock = new THREE.Clock();

        this.spinElectrons = function (elns, pos) {


            for (var i = 0; i < elns.length; i++) {
                var t = clock.getElapsedTime() + i+1*1.5;
                elns[i].position.x = Math.sin(1.5 * t) * pos[i].x;
                elns[i].position.y = Math.sin(1.5 * t) * pos[i].y;
                elns[i].position.z = Math.cos(1.5 * t) * pos[i].z;
            }

        };

        this.render = function () {

            var levels = Object.keys(that.electronsPos);
             for (var i = 0; i < levels.length; i++) {

                that.spinElectrons(electronsUi[levels[i]], that.electronsPos[levels[i]]);
             }
        };

        this.renderUpdates = [this.render];


    };

    Orbitals.prototype.bhorModel = function (atomicNumber, scene) {

        var eConfiguration = this.getConfiguration();

        var levelConfig = this.getLevelConfiguration(eConfiguration[atomicNumber]);


        var levels = Object.keys(levelConfig);

        for (var i = 0; i < levels.length; i++) {

            this.electronsPos[levels[i]] = this.getSpherePositions(levelConfig[levels[i]], i ? i * 400 : 400);

            this.ui_electrons(levels[i], this.electronsPos[levels[i]], scene);

        }


    };

    Orbitals.prototype.updateElectons = function () {

    }





    return Orbitals;

});
