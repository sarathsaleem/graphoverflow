/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, d3, define, brackets: true, $, window, clearTimeout , dat, THREE, TWEEN, requestAnimationFrame, cancelAnimationFrame*/
(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());


define(['utils/utils', 'libs/easing', 'd3', 'libs/three', 'libs/stats', 'libs/tween'], function (_util, FX, ignore) {

    "use strict";

    function rnd(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    function processData(data) {
        var reverseMap = function (data) {
            var revMap = {};
            Object.keys(data.map).forEach(function (value) {
                revMap[data.map[value]] = value;
            });
            data.refMap = revMap;
        };
        reverseMap(data);
        var map = data.refMap,
            language = {},
            eventTypes = {};
        for (var i = 0, len = data.events.length; i < len; i++) {
            var event = data.events[i].split(','),
                lan = map[event[0]],
                eventType = map[event[1]];
            if (language[lan]) {
                language[lan]++;
            } else {
                language[lan] = 1;
            }
            if (eventTypes[eventType]) {
                eventTypes[eventType]++;
            } else {
                eventTypes[eventType] = 1;
            }
        }

        data.language = language;
        data.eventTypes = eventTypes;
        console.log(data)
        return data;
    }

    var gitData = {};


    var TimeLine = function (chart, w, h) {
        var that = this;
        this.canvas = $(chart);
        this.width = w;
        this.height = h;

        this.animationId = 0;
        this.currentPos = 0;

        this.interval = 1000 / 60;
        this.isPlaying = false;
        this.scale = 0; //totalDuration/this.width
        this.pause = false;
        this.stop = true;
        this.finishPlayed = false;
        this.onFinish = function () {};

        this.time = 0;
        this.progress = 0;

        this.duration = (1 * 1000); //default
        this.speed = 1; //default

        this.drawDashboard = function () {

            var languages = Object.keys(gitData.language);

            languages.sort(function (a, b) {
                return gitData.language[b] - gitData.language[a];
            });

            function drawLabel(lang) {

                if (lang === "undefined" || !lang) {
                    return '';
                }

                var label = '<div class="labelWrap"><div class="language ">' + lang + '</div><div class="' + that.data.map[lang] + ' count">0</div></div>';
                return label;
            }

            var languagesStr = '';

            languages.forEach(function (lan) {
                languagesStr += drawLabel(lan);
            });

            var languagesUi = $('<div class="languagesWrapper">' + languagesStr + '</div>');

            this.canvas.append(languagesUi);

            var languageCountRef = {};

            languages.forEach(function (lan) {
                var key = that.data.map[lan];
                languageCountRef[key] = languagesUi.find('.' + key);
            });

            return {
                languageCountLabel: languageCountRef
            };

        };


        var UI = '';

        var progressBar = $('<div class="progressBar"><div class="time one" /><div class="time two" /></div>');
        that.canvas.append(progressBar);

        this.update = function () {

            if (!this.isPlaying) {
                return; // update may happen in render particle before init so check
            }

            if (this.time < this.duration) {
                
                var progressX = this.time/this.duration;
                this.progress = progressX*100;
                this.time += (16.67 * this.speed); //1000/60 * speed;
                
                this.rendering();


            } else {
                
                this.stop = true;
                this.finishPlayed = true;
                this.isPlaying = false;
                console.log('Stop ui render', Date.now() - this.startTime)
                if (typeof this.onFinish === 'function') {
                    //cancelAnimationFrame(timeline.animationId);
                }
            }
        };
        
        var languageCount = {};

        this.rendering = function () {
            var that = this;

            for (var i = 0; i < that.data.events.length; i++) {
                var dataTime = that.data.events[i].split(',')[2] * 1000;
                if (dataTime < that.time) {

                    var lang = that.data.events[i].split(',')[0];

                    if (languageCount[lang]) {
                        languageCount[lang]++;
                    } else {
                        languageCount[lang] = 1;
                    }

                } else {
                    that.data.events.splice(0, i);

                    break;
                }
            }

            progressBar.css("width", this.progress + '%');

        };

        //run  the dom interaction in lower render rate
        this.updatelanguageCount = function () {

            var accessMode = 'textContent';
            if (!UI.languageCountLabel['10'][0].textContent) {
                accessMode = 'innerHTML';
            }

            setInterval(function () {
                var keys = Object.keys(languageCount);

                keys.forEach(function (key) {
                    if (key === '0') {
                        return; //fucking junk data, wasted an hout on this
                    }
                    //[key][fromJquery][textContent]
                    UI.languageCountLabel[key][0][accessMode] = languageCount[key];
                });

            }, 50);


        };
        this.init = function (totalDuration, timelineSpeed, data) {

            this.duration = totalDuration;
            this.speed = timelineSpeed;
            this.scale = this.width / this.duration;

            this.data = data; // data.event [language , type, time]

            this.stop = false;
            this.isPlaying = true;
            this.finishPlayed = false;

            UI = this.drawDashboard();

            this.updatelanguageCount();
            
            this.startTime = Date.now();



        };
    };

    function renderBgParticleScene(container, gitData, timeLine) {

        var containerEle = $(container),
            camera, scene, renderer, stats, controls, particleSys1, particleSys2, values_color, particleSystem1, particleSystem2, colorMap = {},
            eventMap = {},
            tagsElements = new THREE.Object3D(),
            scenes = {
                gitGrid: [],
                languages: [],
                events: []
            },
            currentSceen;

        var particleLength = gitData.events.length;


        renderer = new THREE.WebGLRenderer();
        renderer.setSize(containerEle.innerWidth(), containerEle.innerHeight());
        renderer.domElement.style.position = 'absolute';
        containerEle.append(renderer.domElement);


        scene = new THREE.Scene();


        //set camera
        camera = new THREE.PerspectiveCamera(40, containerEle.innerWidth() / containerEle.innerHeight(), 1, 100000);
        //camera.position.z = 500;

        camera.position.x = 400;
        camera.position.y = 50;
        camera.position.z = -50;


        controls = new THREE.TrackballControls(camera, renderer.domElement);
        controls.rotateSpeed = 0.8;
        controls.minDistance = 0;
        controls.maxDistance = 100000;
        controls.addEventListener('change', function () {
            renderParticles();
        });



        function onWindowResize() {

            camera.aspect = containerEle.innerWidth() / containerEle.innerHeight();
            camera.updateProjectionMatrix();
            renderer.setSize(containerEle.innerWidth(), containerEle.innerHeight());
            renderParticles();
        }

        window.addEventListener('resize', onWindowResize, false);

        $(containerEle).on('click', '.fullscreenControl', function () {
            setTimeout(onWindowResize, 1000);
        });

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        containerEle.append(stats.domElement);


        particleSys1 = new THREE.Geometry();

        var gridColor = d3.scale.linear().domain([0, 20]).range(["#d2f428", "#11bf1d"]);


        function init() {
            generateParticles(particleLength);
            tweenInit();
        }

        function animate() {

            requestAnimationFrame(animate);

            TWEEN.update();
            controls.update();
            renderParticles();

            timeLine.update();

            stats.update();

        }

        function renderParticles() {
            renderer.render(scene, camera);
            particleSystem1.rotation.x += 0.0005;

        }

        var langugeColors = _util.gitColors();
        var colors = d3.scale.category20();

        var lanColor = {};
        Object.keys(gitData.language).forEach(function (lan, i) {
            var color = langugeColors[lan] ? langugeColors[lan].split(',')[0] : colors(i);
            lanColor[lan] = color;
        });
        gitData.lanColor = lanColor;

        function generateParticles(particleLen) {

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

            var vertexShader = [
                    "uniform float amplitude;",
                    "attribute float size;",
                    "attribute vec3 customColor;",
                    "varying vec3 vColor;",
                    "void main() {",
                    "vColor = customColor;",
                    "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
                    "gl_PointSize = size * ( 300.0 / length( mvPosition.xyz ) );",
                    "gl_Position = projectionMatrix * mvPosition;",
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
                attributes: attributes,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                transparent: true
            });


            var values_color = attributes.customColor.value;
            var values_size = attributes.size.value;


            for (var i = 0; i < particleLen; i++) {

                var event = gitData.events[i].split(','),
                    lan = gitData.refMap[event[0]],
                    color = gitData.lanColor[lan];

                var particle = new THREE.Vector3();

                var range = 1000;

                particle.x = i / 10;
                particle.y = rnd(-range, range);
                particle.z = rnd(-range, range);

                particleSys1.vertices.push(particle);


                values_size[i] = 40;
                values_color[i] = new THREE.Color();
                values_color[i].setStyle(color);
            }


            // particles.colors = colors;


            particleSystem1 = new THREE.PointCloud(particleSys1, shaderMaterial);
            //particleSystem2 = new THREE.PointCloud(particleSys2, shaderMaterial);

            //particleSystem.sortParticles = true;
            //particleSystem.dynamic = true;

            scene.add(particleSystem1);
            // scene.add(particleSystem2);
        }

        function tweenInit() {
            TWEEN.removeAll();
            new TWEEN.Tween(camera.position)
                .to({
                    x: 23408,
                    y: 50,
                    z: -50
                }, 40 * 1000)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
        }

        init();
        animate();


    }

    function render(data, container) {
        var time = Date.now();
        console.log('Starting at took : ', Date.now() - time);


        gitData = processData(data);

        console.log('processData took : ', Date.now() - time);
        time = Date.now();
        
        var canvasWidth = 1333.33, //$(canvas).width(),
            canvasHeight = 1000; // $(canvas).height();

        var Chart = $('<div class="chartWrapper"></div>');
        $(container).append(Chart);

        var timeLine = new TimeLine(Chart, canvasWidth, canvasHeight);

        console.log('Timeline obj took : ', Date.now() - time);
        time = Date.now();

        var totalDuration = (24 * 60 * 60 * 1000); //24hr
        var timelineSpeed = 3 * 1000; // x times; total duration of play is 40sec

        //init timeline
        timeLine.init(totalDuration, timelineSpeed, gitData);

        console.log('Timtlint init : ', Date.now() - time);
        time = Date.now();

        //init particles
        renderBgParticleScene(container, gitData, timeLine);

        console.log('Particles : ', Date.now() - time);
        time = Date.now();


    }

    return render;

});