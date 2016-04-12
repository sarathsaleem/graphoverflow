/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, d3, THREE, define, brackets: true, $, window */

define(['libs/three', 'd3'], function (ignore) {
    "use strict";

    //data http://www.periodni.com/electronic_configuration_of_the_elements.html
    //https://en.wikipedia.org/wiki/List_of_data_references_for_chemical_elements
    //http://catalog.flatworldknowledge.com/bookhub/4309?e=averill_1.0-ch06_s05


    var Orbitals = function (data, s) {

        this.scene = s;
        var that = this;
        var electronstring = data.electronstring,
            notations = data.electronstringNotations;

        this.electronsUi = {};
        this.electronsPos = {};
        this.spin = true;



        var geo = new THREE.SphereGeometry(30, 20, 20),
            material = new THREE.MeshLambertMaterial({
                color: '#2c9037'
            }),
            radius = {
                'K': 500,
                'L': 900,
                'M': 1400,
                'N': 2000,
                'O': 2700,
                'P': 3400,
                'Q': 4200
            },
            speed = {
                'K': 0.02,
                'L': 0.022,
                'M': 0.028,
                'N': 0.03,
                'O': 0.035,
                'P': 0.04,
                'Q': 0.045
            };


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

            var points = [];

            // Angle is given by Degree Value
            var arcs = (2 * Math.PI) / steps;
            var alpha = 0;

            for (var i = 0; i < steps; i++) {

                var X = (radius * Math.cos(alpha));
                var Y = (radius * Math.sin(alpha));
                var Z = 0; //(radius * Math.cos(alpha));
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

        /**
         *
         *
         */
        this.getCurrentAngle = function (x, y) {
            var deltaX = x, //x - 0 ,center is 0
                deltaY = y,
                angle = Math.atan2(deltaY, deltaX);

            return angle;
        };

        /**
         *
         *
         */
        var texture = new THREE.TextureLoader().load( '../templates/images/g9/glow.jpg' );


        material = new THREE.MeshLambertMaterial( { map: texture , overdraw: true} );
        this.addUi_electrons = function (level, positions, scene) {

            this.electronsUi[level] = [];

            for (var i = 0; i < positions.length; i++) {

                var sphere = new THREE.Mesh(geo, material);

                var vec = new THREE.Vector3(positions[i].x, positions[i].y, positions[i].z);

                sphere.initAngle = this.getCurrentAngle(positions[i].x, positions[i].y);
                sphere.currentAngle = sphere.initAngle;

                sphere.position.add(vec);
                this.electronsUi[level].push(sphere);
                scene.add(sphere);
            }

            this.addElectronsLevelPath(scene, level);
        };

        /**
         *
         *
         */
        var levelColors = {};
        this.addElectronsLevelPath = function (scene, level) {


            var radius = this.getOribitalRadius(level),
                breaks = this.electronsUi[level].length,
                segments = radius*(breaks > 10 ? 8 : 2.5);

            var circleGeometry = new THREE.CircleGeometry(radius, segments);

            var material = new THREE.LineBasicMaterial({
                    opacity: 1,
                    transparent: true,
                    vertexColors: THREE.VertexColors
                });

            // Remove center vertex
            circleGeometry.vertices.shift();

            var positions = circleGeometry.vertices,
                colors = [],
                breakPoints = positions.length/breaks,
                colorRange = d3.scale.linear().domain([0, breakPoints]).range(["#04f5ff","#000000"]);

            for (var i = 0, br = 0; i < positions.length; i++,br++) {
                if (br >= breakPoints) {
                    br = 0;
                }
                var color = new THREE.Color(colorRange(br));
                colors.push(color);

            }
            circleGeometry.colors = colors;
            circleGeometry.verticesNeedUpdate = true;
            var circle = new THREE.Line(circleGeometry, material);

            levelColors[level] = circle;
            scene.add(circle);
        };

        /**
         *
         *
         */
        this.spinElectrons = function (elns, pos, radius, speed) {

            for (var i = 0; i < elns.length; i++) {

                elns[i].currentAngle = elns[i].currentAngle - speed;

                elns[i].position.x = (Math.cos(elns[i].currentAngle) * radius); // - pos[i].x;
                elns[i].position.y = (Math.sin(elns[i].currentAngle) * radius); // - pos[i].y;
                elns[i].position.z = 0; //(Math.cos(speed * t) * radius);
            }

        };


        this.spinColors = function (level, speed) {
            var circle = levelColors[level];
            circle.rotation.z -= speed;
        };

        this.getOribitalRadius = function (level) {
            return radius[level];
        };

        /**
         *
         *
         */
        this.render = function () {
            if (!that.spin) {
                return;
            }

            var levels = Object.keys(that.electronsPos);
            for (var i = 0; i < levels.length; i++) {
                var level = levels[i];
                that.spinElectrons(that.electronsUi[level], that.electronsPos[level], that.getOribitalRadius(level), speed[level]);
                that.spinColors(level, speed[level]);
            }
        };

        this.renderUpdates = [this.render];


    };



    Orbitals.prototype.bhorModel = function (atomicNumber, scene) {

        var eConfiguration = this.getConfiguration();

        var levelConfig = this.getLevelConfiguration(eConfiguration[atomicNumber]);
        console.log(levelConfig)

        var levels = Object.keys(levelConfig);

        for (var i = 0; i < levels.length; i++) {

            var level = levels[i],
                radius = this.getOribitalRadius(level);

            this.electronsPos[level] = this.getSpherePositions(levelConfig[level], radius);

            this.addUi_electrons(level, this.electronsPos[level], scene);

        }

    };


    return Orbitals;

});
