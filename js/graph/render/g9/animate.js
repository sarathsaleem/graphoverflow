/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define,THREE, brackets: true, $, window, navigator , clearInterval , setInterval, d3*/

define(['utils/utils', '../g9/lightUp', 'd3', 'libs/three', 'libs/stats'], function (_util, lightUp, ignore) {

    "use strict";

    var stats,
        camera, scene, renderer, containerEle,
        mouse = new THREE.Vector2(),
        controls,
        clock = new THREE.Clock(),
        renderUpdates = [],
        lightMe;


    function rnd(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    function animationInit(canvas) {


        containerEle = $(canvas);

        //set camera
        camera = new THREE.PerspectiveCamera(40, containerEle.innerWidth() / containerEle.innerHeight(), 1, 100000);
        camera.position.z = 3000;

        // RENDERER

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setClearColor(0x000000, 0);

        renderer.setSize(containerEle.innerWidth(), containerEle.innerHeight());
        renderer.domElement.style.position = 'absolute';
        containerEle.append(renderer.domElement);


        controls = new THREE.TrackballControls(camera, renderer.domElement);
        controls.noPan = true;
        controls.rotateSpeed = 0.8;
        controls.minDistance = 100;
        controls.maxDistance = 15000;

        scene = new THREE.Scene();
        //scene.fog = new THREE.Fog(0xffffff, 1000, 10000);


        lightMe = new lightUp(scene, containerEle);


        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        stats.domElement.id = 'stats';
        //containerEle.append(stats.domElement);

        var axes = new THREE.AxisHelper(1000);
        //scene.add(axes);


        //
        window.addEventListener('resize', onWindowResize, false);


        function onWindowResize() {
            camera.aspect = containerEle.innerWidth() / containerEle.innerHeight();
            camera.updateProjectionMatrix();
            renderer.setSize(containerEle.innerWidth(), containerEle.innerHeight());

        }

        $(containerEle).on('click', '.fullscreenControl', function () {
            setTimeout(onWindowResize, 1000);
        });
    }


    var setScreenLighting = function (screen) {

        lightMe.lights.forEach(function (light) {
            light.visible = false;
        });

        if (screen === 1) {
            lightMe.lights[0].visible = true;
            lightMe.lights[1].visible = true;
            lightMe.lights[2].visible = true;
        } else {
            lightMe.lights[3].visible = true;
            lightMe.lights[4].visible = true;
        }
    };




    //

    var ctx = null;

    function animate(ref) {

        if (typeof ref === "object") {
            ctx = ref;
        }

        requestAnimationFrame(animate);

        render();
        //stats.update();
        controls.update();
        TWEEN.update();

        if (ctx && ctx.renderUpdates && ctx.renderUpdates.length) {
            ctx.renderUpdates.forEach(function (fns) {
                 fns();
            });
        }

    }

    function render() {

        renderer.render(scene, camera);


    }

    return function (canvas) {
        animationInit(canvas);

        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.renderUpdates = [];
        this.containerEle = containerEle;
        this.controls = controls;

        this.setScreenLighting = setScreenLighting;

        animate(this);

    };


});
