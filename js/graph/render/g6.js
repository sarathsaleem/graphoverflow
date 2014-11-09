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


define(['utils/utils', 'd3', 'gui', 'libs/three', 'libs/stats', 'libs/tween'], function (_util, ignore) {

    "use strict";

    function rnd(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function render(gitData, canvas) {

        var canvasWidth = 1333.33, //$(canvas).width(),
            canvasHeight = 20; // $(canvas).height();


        function compare(a, b) {
            if (a.time < b.time) {
                return -1;
            }
            return 1;
        }
        gitData.sort(compare);


        var language = {},
            event = {},
            grid = {};
        var startBlock = 0,
            last30Sec = 0;

        function parseGitData(dataArr) {
            last30Sec = dataArr[0].time + 30;
            dataArr.forEach(function (data, index) {

                if (data.l) {
                    if (language[data.l]) {
                        language[data.l].push(index);
                    } else {
                        language[data.l] = [];
                        language[data.l].push(index);
                    }
                }
                if (data.type) {
                    if (event[data.type]) {
                        event[data.type].push(index);
                    } else {
                        event[data.type] = [];
                        event[data.type].push(index);
                    }
                }

                if (last30Sec < data.time) {
                    startBlock++;
                    last30Sec = data.time + 30;
                }

                if (grid[startBlock]) {
                    grid[startBlock].push(index);
                } else {
                    grid[startBlock] = [];
                    grid[startBlock].push(index);
                }

            });
            return {
                arr: gitData,
                language: language,
                event: event,
                grid: grid
            };
        }
        var gui = new dat.GUI({
            autoPlace: false
        });
        //canvas.appendChild(gui.domElement);


        var Chart = d3.select(canvas).append("svg");
        Chart.attr("viewBox", "0 0 " + canvasWidth + " " + canvasHeight)
            .attr("preserveAspectRatio", "xMidYMid");


        var GitHour = function () {
            var that = this;
            this.speed = 200;
            this.speedEvent = gui.add(this, 'speed', 10, 1000);
            this.startTime = Date.now();
            this.timer = Date.now();
            this.count = 0;
            this.data = [];
            this.animationId = 0;
            this.time = 0;
            this.progress = 0;
            this.endTime = 0;
            this.stop = true;
            this.finishPlayed = true;
            this.isPlaying = false;
            this.eventno = 0;
            this.onFinish = function () {};

            this.addAnEvent = function (data) {
                var moveToX = rnd(0, canvasWidth),
                    moveToY = rnd(0, 1000);
                Chart.append('circle')
                    .attr('class', 'day')
                    .attr("r", function () {
                        return rnd(2, 10);
                    })
                    .style("fill", function () {
                        return getColor(data.l.toLowerCase());
                    })
                    .transition().duration(500).ease("easeIn")
                    .attr("transform", function () {
                        return "translate(" + moveToX + "," + moveToY + ")";
                    }).remove();
                this.eventno++;
            };

            this.update = function () {

                if (this.time < this.endTime) {
                    var inc = 16 * this.speed; //1000/60 * speed;
                    this.timer += inc;
                    this.time += inc;
                } else {
                    this.stop = true;
                    this.finishPlayed = true;
                    if (typeof this.onFinish === 'function') {
                        this.onFinish(this.initialExploders);
                        cancelAnimationFrame(this.animationId);
                    }
                }
            };

            this.render = function () {

                this.animationId = requestAnimationFrame(this.render.bind(this));

                var progressTime = new Date(Math.abs(this.time));

                this.update.call(this);

                var currentCount = 0;

                for (var i = 0; i < this.data.arr.length; i++) {
                    var data = this.data.arr[i];
                    var dataTime = data.time * 1000;

                    if (dataTime < this.time) {

                        // this.addAnEvent(data);

                        currentCount++;

                        this.data.arr.splice(i, 1);

                    } else {
                        break;
                    }
                }

                var progress = (this.timer - this.startTime) / 60 / 60 / 1000;

                //progressUi.attr("width", progress * canvasWidth);
                //text.text(progress);

            };

            this.start = function () {
                that.data = parseGitData(gitData);
                //make initial time as git event time
                var startTime = that.data.arr[0].time * 1000; //add milli sec since I removed it from json
                that.time = startTime;
                that.initTime = startTime;
                var addHours = function (O, h) {
                    O.setHours(O.getHours() + h);
                    return O;
                };
                that.endTime = Date.parse(addHours(new Date(startTime), 1)); //+1 hr

                //that.render();
                var now = Date.now();                
                buildParticleWorld(canvas, that.data);
                console.log(Date.now() - now)
            };
        };

        var GIT = new GitHour();


        GIT.start();

    }


    function buildParticleWorld(container, data) {

        var containerEle = $(container),
            camera, scene, renderer, stats, controls, particles, values_color, particleSystem, material,
            scenes = {
                gitGrid: [],
                languages: [],
                events : []
            },
            currentSceen;

        var particleLength = data.arr.length;


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
        
        $(containerEle).on('click', '.fullscreenControl', function(){
            setTimeout(onWindowResize,1000);
        });

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        containerEle.append(stats.domElement);


        particles = new THREE.Geometry();


        /*
        STORY:
        ------

        Initially all the events will fly to the screen and form a git contribution green style

        One hour data = 60 mins = 30sec * 120

        these 120 blocks will be divided as 24x5 grid


        */

        var gridColor = d3.scale.linear().domain([0, 20]).range(["#d2f428", "#11bf1d"]);

        function init() {

            generateParticles(particleLength);
            gererateGitGrid(data);
            generateLanguage(data);
            generateEvents(data);

        }

        function animate() {

            requestAnimationFrame(animate);
            TWEEN.update();
            controls.update();
            stats.update();
            //renderParticles();

        }

        function renderParticles() {
            renderer.render(scene, camera);           
        }

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

                var particle = new THREE.Vector3();
                particles.vertices.push(particle);
                particles.vertices[i].x = Math.random() * 1000 - 500;
                particles.vertices[i].y = Math.random() * 1000 - 500;
                particles.vertices[i].z = Math.random() * 1000 - 500;
                
                values_size[i] = 40;
                values_color[i] = new THREE.Color();
                values_color[i].setHSL(Math.random(), 1.0, 0.5);
            }

          

            var shaderMaterial = new THREE.ShaderMaterial({
                uniforms: uniforms,
                attributes: attributes,
                vertexShader: document.getElementById('vertexshader1').textContent,
                fragmentShader: document.getElementById('fragmentshader1').textContent,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                transparent: true
            });


            // particles.colors = colors;


            particleSystem = new THREE.PointCloud(particles, shaderMaterial);

            particleSystem.sortParticles = true;
            //particleSystem.dynamic = true;

           

            scene.add(particleSystem);
        }

        function gererateGitGrid(data) {

            var block = 100,
                len = Object.keys(data.grid).length,
                mod = Math.round(len / 5),
                row = 0,
                left = 0,
                top = 0;

            var vector = new THREE.Vector3();

            for (var i = 0; i < len; i++) {
                
                //Grid
                if (i % mod === 0) {
                    row++;
                    left = 0;
                }

                left = -1000 + ((i % mod) * block);
                top = -300 + (row * block);
                var color = gridColor(rnd(0, 20));
                for (var j = 0, gridLen = data.grid[i].length; j < gridLen; j++) {
                    var object = {
                        geo: new THREE.Object3D(),
                        color: color
                    };

                    object.geo.position.x = rnd(left, left + 80);
                    object.geo.position.y = rnd(top, top + 80);
                    object.geo.position.z = rnd(0, 100);

                    object.color = color;

                    object.geo.lookAt(vector);
                    scenes.gitGrid.push(object);
                }



            }

        }

        function generateLanguage(data) {

            var vector = new THREE.Vector3();

            function generateSpheres(n, left, top, index, r, color) {
                var l = n;
                r = r || 500;
                for (var i = 0; i < n; i++) {
                    var phi = Math.acos(-1 + (2 * i) / l);
                    var theta = Math.sqrt(l * Math.PI) * phi;
                    var object = {
                        geo: new THREE.Object3D(),
                        color: color
                    };
                    object.geo.position.x = left + r * Math.cos(theta) * Math.sin(phi);
                    object.geo.position.y = top + r * Math.sin(theta) * Math.sin(phi);
                    object.geo.position.z = index + r * Math.cos(phi);

                    object.geo.lookAt(vector);
                    scenes.languages.push(object);

                }
            }

            var scale = 0.08;
            
            var colors = _util.getTagColors();
            var colorMap = {};
            Object.keys(data.language).forEach(function (lan) {
                var count = data.language[lan].length,
                    color = colors[lan.toLocaleLowerCase()] ? colors[lan.toLocaleLowerCase()].split(',')[0] : '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6),
                    radius = count * scale;
                
                colorMap[lan] = color;
                generateSpheres(count, rnd(-500, 500), rnd(-500, 500), rnd(-500, 500), radius, color);

            });
            console.log(colorMap);
        }

        function generateEvents() {
            var vector = new THREE.Vector3();
            function f(x) {
                return 50 * Math.sin(0.05 * x) + 50;
            }

            function generateEventLayout(n, left, top, index, r, color) {
               
                r = r || 500;
                var a =1,
                    b =1;
                for (var i = 0; i < n; i++) {
                    var angle = 0.2 * i;
                    var x = left + (a + b * angle) * Math.cos(angle);
                    var y = top + (a + b * angle) * Math.sin(angle);
                    var object = {
                        geo: new THREE.Object3D(),
                        color: color
                    };
                    object.geo.position.x = x;
                    object.geo.position.y = y;
                    object.geo.position.z = index;

                    object.geo.lookAt(vector);
                    scenes.events.push(object);

                }
            }
            var left = -2000;   
            Object.keys(data.event).forEach(function (eve) {

                var count = data.event[eve].length,
                    color = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6),
                    radius = 300;
                left += 200;
                generateEventLayout(count, rnd(500, 500), rnd(-500, 500), rnd(-500, 500), radius, color);

            });
        }

        function changeScene(particeLen, shape, duration) {
            TWEEN.removeAll();

            for (var i = 0; i < particeLen; i++) {

                var particle = particles.vertices[i];

                values_color[i].setStyle(shape[i].color || '#FF0000');

                var target = shape[i].geo;

                new TWEEN.Tween(particle)
                    .to({
                        x: target.position.x,
                        y: target.position.y,
                        z: target.position.z
                    }, Math.random() * duration + duration)
                    .easing(TWEEN.Easing.Exponential.InOut)
                    .start();

            }

            new TWEEN.Tween(this)
                .to({}, duration * 2)
                .onUpdate(renderParticles)
                .start();
        }

        function changeCameraView(target, duration) {


            new TWEEN.Tween(camera.position)
                .to({
                    x: target.position.x,
                    y: target.position.y,
                    z: target.position.z
                }, Math.random() * duration + duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .onComplete(function () {
                    //controls.reset();
                })
                .start();



            /*var pos = camera.rotation.clone();
            new TWEEN.Tween(pos)
                .to(new THREE.Vector3(target.rotation.x, target.rotation.y, target.rotation.z), duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .onUpdate(
                    function () {
                        // copy incoming position into capera position
                        camera.rotation.copy(pos);
                    })
                .start();*/

        }


        init();
        animate();


        //add dom elements
        $(function(){
            var button = $('<div id="grid" class="g6-button">Grid</div>');
            $(container).append(button);
            $('body').on('click', "#grid", function (event) {

                var target = {
                    position: {
                        x: 0,
                        y: 0,
                        z: 3000
                    },
                    rotation: {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                };
                if (currentSceen !== 'grid') {
                    changeScene(particleLength, scenes.gitGrid, 5000);
                    currentSceen = 'grid';
                }
                changeCameraView(target, 5000);
            });
            var button2 = $('<div id="laguages" class="g6-button">Laguages</div>');
            $(container).append(button2);
            $('body').on('click', "#laguages", function (event) {

                var target = {
                    position: {
                        x: 1000,
                        y: 1000,
                        z: 1000
                    },
                    rotation: {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                };
                if (currentSceen !== 'languages') {
                    changeScene(particleLength, scenes.languages, 5000);
                    currentSceen = 'languages';
                }
                changeCameraView(target, 3000);
            });
            var button3 = $('<div id="events" class="g6-button">Events</div>');
            $(container).append(button3);
            $('body').on('click', "#events", function (event) {

                var target = {
                    position: {
                        x: -500,
                        y: 0,
                        z: 2000
                    },
                    rotation: {
                        x: 0,
                        y: 0,
                        z: 500
                    }
                };
                if (currentSceen !== 'events') {
                    changeScene(particleLength, scenes.events, 5000);
                    currentSceen = 'events';
                }
                changeCameraView(target, 3000);
            });
            
            $('body').on('click', '.g6-button', function(){
                $('.g6-button').removeClass('active');
                $(this).addClass('active');
            });
            
            setTimeout(function(){
                $("#grid").click();
            },2000);
            
        });


    }

    return render;

});