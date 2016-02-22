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



        var geo = new THREE.SphereGeometry(this.protonRadius, 20, 20),
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

        var particles = new THREE.BufferGeometry(),
            particleSystem;
        this.generateParticles = function (positions, scene) {

            var particleLen = positions.lenth;
            var attributes = {
                size: {
                    type: 'f',
                    value: []
                },
                customColor: {
                    type: 'c',
                    value: []
                }
            };

            var uniforms = {
                amplitude: {
                    type: "f",
                    value: 1.0
                },
                color: {
                    type: "c",
                    value: new THREE.Color("#fff")
                },
                texture: {
                    type: "t",
                    value: THREE.ImageUtils.loadTexture("../templates/images/g6-git/ball.png")
                }
            };

            var positions = new Float32Array(particleLen * 3);
            var colors = new Float32Array(particleLen * 3);
            var sizes = new Float32Array(particleLen);


            //for (var i = 0; i < particleLen; i++) {
            var color = new THREE.Color();

            for (var i = 0, i3 = 0; i < particleLen; i++, i3 += 3) {

                positions[i3 + 0] = positions[i].x;
                positions[i3 + 1] = positions[i].y;
                positions[i3 + 2] = positions[i].z;

                color.setHSL(i / particleLen, 1.0, 0.5);

                colors[i3 + 0] = color.r;
                colors[i3 + 1] = color.g;
                colors[i3 + 2] = color.b;

                sizes[i] = 20;
            }


            var vertexShader = [
                    "uniform float amplitude;",
                    "attribute float size;",
                    "attribute vec3 customColor;",
                    "varying vec3 vColor;",
                    "void main() {",
                        "vColor = customColor;",
                        "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
                        "gl_PointSize = size * ( 300.0 / length( mvPosition.xyz ) );",
                        " gl_Position = projectionMatrix * mvPosition;",
                    "}"
                    ].join("\n"),

                fragmentShader = [
                    "uniform vec3 color;",
                    "uniform sampler2D texture;",
                    "varying vec3 vColor;",
                    "void main() {",
                        "gl_FragColor = vec4( color * vColor, 1.0 );",
                        "gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );",
                    "}"
                ].join("\n");



            var shaderMaterial = new THREE.ShaderMaterial({
                uniforms: uniforms,
                //attributes: attributes,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                transparent: true
            });


            // particles.colors = colors;

            particles.addAttribute('position', new THREE.BufferAttribute(positions, 3));
            particles.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
            particles.addAttribute('size', new THREE.BufferAttribute(sizes, 1));



            particleSystem = new THREE.PointCloud(particles, shaderMaterial);

            particleSystem.sortParticles = true;
            //particleSystem.dynamic = true;



            scene.add(particleSystem);
        };

        this.addUi_electrons = function (level, positions, scene) {

            this.electronsUi[level] = [];

            for (var i = 0; i < positions.length; i++) {

                var sphere = new THREE.Mesh(geo, material);

                var vec = new THREE.Vector3(positions[i].x, positions[i].y, positions[i].z);

                sphere.initAngle = this.getCurrentAngle(positions[i].x, positions[i].y);
                sphere.currentAngle = sphere.initAngle;

                sphere.position.add(vec);
                this.electronsUi[level].push(sphere);
                //scene.add(sphere);

                this.addElectronsLevelPath(scene, level);
            }

            this.generateParticles(positions, scene);
        };

        /**
         *
         *
         */
        this.addElectronsLevelPath = function (scene, level) {

            var material = new THREE.LineBasicMaterial({
                color: "#ffffff",
                opacity: 0.25,
                transparent: true,
            });
            var radius = this.getOribitalRadius(level);
            var segments = 100;

            var circleGeometry = new THREE.CircleGeometry(radius, segments);
            // Remove center vertex
            circleGeometry.vertices.shift();

            var circle = new THREE.Line(circleGeometry, material);

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
                //that.spinElectrons(that.electronsUi[level], that.electronsPos[level], that.getOribitalRadius(level), speed[level]);
            }
        };

        this.renderUpdates = [this.render];


    };



    Orbitals.prototype.bhorModel = function (atomicNumber, scene) {

        var eConfiguration = this.getConfiguration();

        var levelConfig = this.getLevelConfiguration(eConfiguration[atomicNumber]);


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
