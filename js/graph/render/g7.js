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


define(['utils/utils', 'd3', 'libs/three', 'libs/stats', 'libs/tween'], function (_util, ignore) {

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
        return data;
    }


    function render(data, container) {


        var gitData = processData(data);


        var containerEle = $(container),
            camera, scene, renderer, stats, controls, particles, values_color, particleSystem, colorMap = {},
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
        camera.position.z = 500;

        controls = new THREE.TrackballControls(camera, renderer.domElement);
        controls.rotateSpeed = 0.8;
        controls.minDistance = 0;
        controls.maxDistance = 100000;
        controls.addEventListener('change', renderParticles);



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


        particles = new THREE.Geometry();
    
        var gridColor = d3.scale.linear().domain([0, 20]).range(["#d2f428", "#11bf1d"]);

        function init() {
            generateParticles(particleLength);
            changeScene();
        }

        function animate() {

            requestAnimationFrame(animate);
            TWEEN.update();
            controls.update();
            renderParticles();

            stats.update();

        }

        function renderParticles() {
            renderer.render(scene, camera);
            particleSystem.rotation.y += 0.0005;
            particleSystem.rotation.x += 0.0005;
            particleSystem.rotation.z += 0.0005;

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

            values_color = attributes.customColor.value;
            var values_size = attributes.size.value;


            for (var i = 0; i < particleLen; i++) {
                
                var event = gitData.events[i].split(','),
                lan = gitData.refMap[event[0]],
                color = gitData.lanColor[lan];
                
                var particle = new THREE.Vector3();
                particles.vertices.push(particle);
                var range = 1000;
                particles.vertices[i].x = rnd(-range, range);
                particles.vertices[i].y = rnd(-range, range);
                particles.vertices[i].z = rnd(-range, range);

                values_size[i] = 40;
                values_color[i] = new THREE.Color();
                values_color[i].setStyle(color);
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
                attributes: attributes,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                transparent: true
            });


            // particles.colors = colors;


            particleSystem = new THREE.PointCloud(particles, shaderMaterial);

            //particleSystem.sortParticles = true;
            //particleSystem.dynamic = true;

            scene.add(particleSystem);
        }
        
        function changeScene(particeLen, shape, duration) {
            TWEEN.removeAll();

            new TWEEN.Tween(this)
                .to({}, 2000 * 2)
                .onUpdate(renderParticles)
                .start();
        }


        init();
        animate();





    }

    return render;

});