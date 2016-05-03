/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, d3, THREE, define, brackets: true, $, window , Float32Array */

define(['libs/three', 'd3'], function (ignore) {
    "use strict";

    //data http://www.periodni.com/electronic_configuration_of_the_elements.html
    //https://en.wikipedia.org/wiki/List_of_data_references_for_chemical_elements
    //http://catalog.flatworldknowledge.com/bookhub/4309?e=averill_1.0-ch06_s05


    var Orbitals = function (data, s) {

        this.stage = s;
        var that = this;
        var electronstring = data.electronstring,
            notations = data.electronstringNotations,
            levelColors = {},
            eConfiguration = null,
            levelNotatins = [null, 'K', 'L', 'M', 'N', 'O', 'P', 'Q'];

        this.electronsUi = {};
        this.electronsPos = {};
        this.spin = true;
        this.showShellsLabel = false;
        this.shellsLabel = function (show) {
            if (show) {
                $('.shellInfo').fadeIn(400);
                that.showShellsLabel = true;
            } else {
                $('.shellInfo').hide();
                that.showShellsLabel = false;
            }
        };



        var geo = new THREE.SphereGeometry(10, 100, 100),
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
            },
            electronTexture = new THREE.TextureLoader().load('../templates/images/g9/electron.png');


        var particles = new THREE.BufferGeometry(),
            totoalPos = 0,
            positionsArr = [],
            posArr,
            materialParticle = new THREE.MeshBasicMaterial({
                color: '#005f0b'
            });

        /**
         *
         *
         */
        this.resetVars = function () {

            levelColors = {};
            eConfiguration = null;

            this.electronsUi = {};
            this.electronsPos = {};
            this.spin = true;

            particles = new THREE.BufferGeometry();
            totoalPos = 0;
            positionsArr = [];
            posArr = [];


        };

        this.getConfiguration = function () {

            if (eConfiguration) {
                return eConfiguration;
            }

            eConfiguration = {};
            var atomicNumbers = Object.keys(electronstring);

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

        this.getLevelSplitConfiguration = function (eConfugration) {
            var eC = eConfugration;

            var levels = eC.split(' '),
                levelConfigs = {};

            levels.forEach(function (level) {
                var sL = level[0],
                    sLName = levelNotatins[sL];
                if (levelConfigs[sLName]) {
                    levelConfigs[sLName].push(level);
                } else {
                    levelConfigs[sLName] = [level];
                }
            });

            return levelConfigs;
        };

        /**
         *
         *
         */
        this.getLevelConfiguration = function (string) {
            var levelsConfigs = {},
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


        this.addUi_electrons = function (level, positions) {

            this.electronsUi[level] = [];


            var particleLen = positions.length;
            totoalPos += particleLen;
            positionsArr = positionsArr.concat(positions);


            for (var i = 0, i3 = 0; i < particleLen; i++, i3 += 3) {
                var sphere = new THREE.Mesh(geo, materialParticle);
                var vec = new THREE.Vector3(positions[i].x, positions[i].y, positions[i].z);
                sphere.position.add(vec);

                sphere.initAngle = this.getCurrentAngle(positions[i].x, positions[i].y);
                sphere.currentAngle = sphere.initAngle;

                this.electronsUi[level].push(sphere);
                this.stage.add(sphere);
            }

            this.addElectronsLevelPath(level);
        };

        this.addElectronsToScreen = function () {
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
                    value: electronTexture
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

            posArr = new Float32Array(totoalPos * 3);
            var colors = new Float32Array(totoalPos * 3);
            var sizes = new Float32Array(totoalPos);

            var color = new THREE.Color();

            for (var i = 0, i3 = 0; i < totoalPos; i++, i3 += 3) {

                posArr[i3 + 0] = positionsArr[i].x;
                posArr[i3 + 1] = positionsArr[i].y;
                posArr[i3 + 2] = 0;

                color.setStyle('#3498DB');
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

        this.addElectronsLevelPath = function (level) {


            var radius = this.getOribitalRadius(level),
                breaks = this.electronsUi[level].length,
                segments = radius * (breaks > 10 ? 8 : 2.5);

            var circleGeometry = new THREE.CircleGeometry(radius, segments);
            circleGeometry.vertices.shift();

            var material = new THREE.LineBasicMaterial({
                opacity: 1,
                transparent: true,
                vertexColors: THREE.VertexColors
            });


            var positions = circleGeometry.vertices,
                colors = [],
                breakPoints = positions.length / breaks,
                colorRange = d3.scale.linear().domain([0, breakPoints]).range(["#04f5ff", "#3498DB"]);

            for (var i = 0, br = 0; i < positions.length; i++, br++) {
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
            this.stage.add(circle);

        };


        this.addElectronGuidLine = function (levels, animate) {

            var camera = animate.camera;

            var canvas = animate.renderer.domElement;

            function connect(pos, ele) {

                // bottom right
                var x1 = pos.x1;
                var y1 = pos.y1;
                // top right
                var x2 = pos.x2;
                var y2 = pos.y2;
                // distance
                var length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
                // center
                var cx = ((x1 + x2) / 2) - (length / 2);
                var cy = ((y1 + y2) / 2) - (1 / 2);
                // angle
                var angle = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);
                // make hr
                ele.css({
                    'transform':"rotate(" + angle + "deg)",
                    left: cx + "px",
                    top: cy + "px",
                    width: length + "px"
                });
            }

            var vector = new THREE.Vector3(0, 0, 0);
            var points = [],
                lines = [];

            levels.forEach(function (level) {
                var elementInfo = $('<div class="marker shellInfo">'+level+'</div>');
                animate.containerEle.append(elementInfo);
                points.push({level :level , element: elementInfo});

                var line = $('<div class="line shellInfo" />');
                animate.containerEle.append(line);
                lines.push(line);

            });

            this.update = function () {
                if (!this.showShellsLabel) {
                    return;
                }

                points.forEach(function(point, i) {

                    vector = new THREE.Vector3(radius[point.level], 0, 0);
                    vector.project(camera);

                    // map to 2D screen space
                    vector.x = Math.round((vector.x + 1) * canvas.width / 2);
                    vector.y = Math.round((-vector.y + 1) * canvas.height / 2);
                    vector.z = 0;

                    var x1 = vector.x + 50,
                        y1 = vector.y - 150;
                    point.element.css({
                        "transform": "translate3d(" + x1 + "px, " + y1 + "px, 0px)"
                    });
                    connect({x1: x1, y1: y1+42, x2:vector.x, y2: vector.y  }, lines[i]);
                });


            };

            return this;
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

            that.guidlines.update();

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

        };

        this.renderUpdates = [this.render];


    };



    Orbitals.prototype.bhorModel = function (atomicNumber, app) {


        if (!atomicNumber) {
            console.log('Error loading atomic data', atomicNumber);
            return;
        }

        this.resetVars();

        var eConfiguration = this.getConfiguration();

        var levelConfig = this.getLevelConfiguration(eConfiguration[atomicNumber]);

        app.atomicConfig = levelConfig;

        var levels = Object.keys(levelConfig);



        for (var i = 0; i < levels.length; i++) {

            var level = levels[i],
                radius = this.getOribitalRadius(level);
            this.electronsPos[level] = this.getSpherePositions(levelConfig[level], radius);
            this.addUi_electrons(level, this.electronsPos[level]);

        }

        this.addElectronsToScreen();

        this.guidlines = this.addElectronGuidLine(levels, app.animate);

        window.addEventListener('resize', this.guidlines.onResize, false);

    };


    return Orbitals;

});
