/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, d3, THREE, define, brackets: true, $, window */

define(['libs/three', 'd3'], function (ignore) {
    "use strict";

    //data http://www.periodni.com/electronic_configuration_of_the_elements.html
    //https://en.wikipedia.org/wiki/List_of_data_references_for_chemical_elements
    //http://catalog.flatworldknowledge.com/bookhub/4309?e=averill_1.0-ch06_s05


    var Orbitals = function (data, s) {

        this.stage = s;
        var that = this;
        var electronstring = data.electronstring,
            notations = data.electronstringNotations;

        this.electronsUi = {};
        this.electronsPos = {};
        this.spin = true;



        var geo = new THREE.SphereGeometry(10, 20, 20),
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
                value:  new THREE.TextureLoader().load( '../templates/images/g9/electron.png' )
            }
        };

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
            //depthTest:false,
            transparent: true
        });



        var particles = new THREE.BufferGeometry(),
            totoalPos = 0,
            positionsArr = [],
            posArr;


        material = new THREE.MeshBasicMaterial( {color: '#005f0b'} );
        this.addUi_electrons = function (level, positions, scene) {

            this.electronsUi[level] = [];


            var particleLen = positions.length;
            totoalPos += particleLen;
            positionsArr = positionsArr.concat(positions);


            for (var i = 0, i3 = 0; i < particleLen; i++, i3 += 3) {
                var sphere = new THREE.Mesh(geo,  material);
                var vec = new THREE.Vector3(positions[i].x, positions[i].y, positions[i].z);
                sphere.position.add(vec);

                sphere.initAngle = this.getCurrentAngle(positions[i].x, positions[i].y);
                sphere.currentAngle = sphere.initAngle;

                this.electronsUi[level].push(sphere);
                this.stage.add(sphere);
            }

            this.addElectronsLevelPath(scene, level);
        };

        this.addElectronsToScreen = function () {

            posArr = new Float32Array(totoalPos * 3);
            var colors = new Float32Array(totoalPos * 3);
            var sizes = new Float32Array(totoalPos);

            var color = new THREE.Color();

            for (var i = 0, i3 = 0; i < totoalPos; i++, i3 += 3) {

                posArr[i3 + 0] = positionsArr[i].x;
                posArr[i3 + 1] = positionsArr[i].y;
                posArr[i3 + 2] = 0;

                color.setStyle('#008e10');
                colors[i3 + 0] = color.r;
                colors[i3 + 1] = color.g;
                colors[i3 + 2] = color.b;

                sizes[i] = 500;
            }


            var particleSystem = new THREE.Points(particles, shaderMaterial);

            particleSystem.sortParticles = true;


            particles.addAttribute('position', new THREE.BufferAttribute(posArr, 3));
            particles.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
            particles.addAttribute('size', new THREE.BufferAttribute(sizes, 1));


            this.stage.add(particleSystem);

        };

        /**
         *
         *
         */
        var levelColors = {};
        var circle,alphas;
        this.addElectronsLevelPath = function (scene, level) {


            var radius = this.getOribitalRadius(level),
                breaks = this.electronsUi[level].length,
                segments = radius*(breaks > 10 ? 8 : 2.5);

            var circleGeometry = new THREE.CircleGeometry(radius, segments);

             // add an attribute
            var numVertices = circleGeometry.vertices.count;
            alphas = new Float32Array( numVertices * 1 ); // 1 values per vertex

            for( var i = 0; i < numVertices; i ++ ) {

                // set alpha randomly
                alphas[ i ] = Math.random();

            }

            circleGeometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

            // uniforms
            uniforms = {

                color: { type: "c", value: new THREE.Color( 0x00ff00 ) },

            };

            // point cloud material
            var shaderMaterial = new THREE.ShaderMaterial( {

                uniforms:       uniforms,
                vertexShader:   document.getElementById( 'vertexshader' ).textContent,
                fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
                transparent:    true

            });

/*
            var material = new THREE.LineBasicMaterial({
                    opacity: 1,
                    transparent: true,
                    vertexColors: THREE.VertexColors
                });*/

            // Remove center vertex
            circleGeometry.vertices.shift();

           /* var positions = circleGeometry.vertices,
                colors = [],
                breakPoints = positions.length/breaks,
                colorRange = d3.scale.linear().domain([0, breakPoints/2, breakPoints]).range(["#04f5ff", "#3498DB" ,  "#3498DB"]);

            for (var i = 0, br = 0; i < positions.length; i++,br++) {
                if (br >= breakPoints) {
                    br = 0;
                }
                var color = new THREE.Color(colorRange(br));
                colors.push(color);

            }
            circleGeometry.colors = colors;
            circleGeometry.verticesNeedUpdate = true;*/
            circle = new THREE.Line(circleGeometry, shaderMaterial);

            levelColors[level] = circle;
            this.stage.add(circle);
            scene.add(this.stage);
        };

        /**
         *
         *
         */
        this.spinElectrons = function () {

            var levels = Object.keys(that.electronsPos),
                i3 = 0;

            for (var i = 0; i < levels.length; i++) {

                var level = levels[i];
                var elns = that.electronsUi[level],
                    radius = that.getOribitalRadius(level),
                    sp = speed[level];

                for (var j = 0; j < elns.length; j++, i3 += 3) {

                    elns[j].currentAngle = elns[j].currentAngle - sp;

                    elns[j].position.x = (Math.cos(elns[j].currentAngle) * radius); // - pos[i].x;
                    elns[j].position.y = (Math.sin(elns[j].currentAngle) * radius); // - pos[i].y;
                    elns[j].position.z = 0;


                    posArr[i3 + 0] = (Math.cos(elns[j].currentAngle) * radius); // - pos[i].x;
                    posArr[i3 + 1] = (Math.sin(elns[j].currentAngle) * radius); // - pos[i].y;
                    posArr[i3 + 2] = 0;

                }

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
                that.spinColors(level, speed[level]);
            }
            that.spinElectrons();
            particles.attributes.position.needsUpdate = true;
            particles.attributes.customColor.needsUpdate = true;


            var alphas = circle.geometry.attributes.alpha;
            var count = alphas.count;

            for( var i = 0; i < count; i ++ ) {

                // dynamically change alphas
                alphas.array[ i ] *= 0.95;

                if ( alphas.array[ i ] < 0.01 ) {
                    alphas.array[ i ] = 1.0;
                }

            }

            alphas.needsUpdate = true; // important!

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

        this.addElectronsToScreen();

    };


    return Orbitals;

});
