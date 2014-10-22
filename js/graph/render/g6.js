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

    function render(gitData, canvas) {

        var canvasWidth = 1333.33, //$(canvas).width(),
            canvasHeight = 1000; // $(canvas).height();


        function compare(a, b) {
            if (a.time < b.time) {
                return -1;
            }
            return 1;
        }
        gitData.sort(compare);

        function rnd(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

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
                grid : grid
            };
        }
        var gui = new dat.GUI({
            autoPlace: false
        });
        canvas.appendChild(gui.domElement);


        var Chart = d3.select(canvas).append("svg");
        Chart.attr("viewBox", "0 0 " + canvasWidth + " " + canvasHeight)
            .attr("preserveAspectRatio", "xMidYMid");

        var text = Chart.append("text")
            .attr("transform", "translate(200,200)")
            .text("Start timer");

        var progressBar = Chart.append('g').attr("transform", "translate(0,  990)");
        progressBar.append('rect')
            .attr('width', canvasWidth).attr('height', 20)
            .style('fill', '#59636D');
        var progressUi = progressBar.append('rect').attr('class', 'progress').attr('width', 500).attr('height', 20).style('fill', '#06E58A');

        var getColorScale = d3.scale.category20(),
            colorList = _util.getTagColors();

        //add colors ids
        var colorNames = Object.keys(colorList);
        colorNames.forEach(function (tag) {
            _util.addGradient(Chart.selectAll("svg")[0].parentNode, tag, colorList[tag].split(','));

        });

        function getColor(name) {
            return colorNames.indexOf(name) > -1 ? "url(#grad-" + name + ")" : getColorScale(rnd(0, 20));
        }

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

                progressUi.attr("width", progress * canvasWidth);
                text.text(progress);

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

                that.render();
                buildParticleWorld(canvas, that.data);
            };
        };

        var GIT = new GitHour();


        GIT.start();

    }


    function buildParticleWorld(container, data) {

        var containerEle = $(container),
            camera, scene, renderer, stats, controls;

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(containerEle.innerWidth(), containerEle.innerHeight());
        renderer.domElement.style.position = 'absolute';
        containerEle.append(renderer.domElement);

        //set camera
        camera = new THREE.PerspectiveCamera(40, containerEle.innerWidth() / containerEle.innerHeight(), 1, 100000);
        camera.position.z = 3000;

        controls = new THREE.TrackballControls(camera, renderer.domElement);
        controls.rotateSpeed = 0.5;
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

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        containerEle.append(stats.domElement);

        /*
        STORY:
        ------

        Initially all the events will fly to the screen and form a git contribution green style

        One hour data = 60 mins = 30sec * 120

        these 120 blocks will be divided as 24x5 grid


        */
        function init() {

            scene = new THREE.Scene();

            gererateContributionGrid(data);


        }

        function animate() {

            requestAnimationFrame(animate);
            TWEEN.update();
            controls.update();
            stats.update();

        }

        function renderParticles() {
            renderer.render(scene, camera);
        }

        function gererateContributionGrid(data) {

            var block = 100,
                margin = 20,
                len = Object.keys(data.grid).length,
                mod = len/5,
                row = 0,
                left = 0,
                top = 0;

            for(var i = 0; i < len ; i++) {

                if (i%mod === 0) {
                    row ++;
                }

                left = (i%mod) * block + margin;
                top = row * block;

            }

        }


        init();
        animate();


    }

    return render;

});
