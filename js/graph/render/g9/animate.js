/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define,THREE, brackets: true, $, window, navigator , clearInterval , setInterval, d3*/

define(['utils/utils', 'd3', 'libs/three', 'libs/stats'], function (_util, ignore) {

    "use strict";

    var stats,
        camera, scene, renderer,
        mouse = new THREE.Vector2(),
        controls,
        clock = new THREE.Clock(),
        renderUpdates = [];


    function rnd(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    function animationInit(canvas) {


        var containerEle = $(canvas);

        //set camera
        camera = new THREE.PerspectiveCamera(40, containerEle.innerWidth() / containerEle.innerHeight(), 1, 100000);
        camera.position.z = 500;

        // RENDERER

        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        //renderer.setClearColor(scene.fog.color, 1);

        renderer.setSize(containerEle.innerWidth(), containerEle.innerHeight());
        renderer.domElement.style.position = 'absolute';
        containerEle.append(renderer.domElement);


        controls = new THREE.TrackballControls(camera, renderer.domElement);

        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xffffff, 1000, 10000);


        // LIGHTS
        var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.25);
        hemiLight.color.setHSL(0.6, 1, 0.75);
        hemiLight.groundColor.setHSL(0.1, 0.8, 0.7);
        hemiLight.position.y = 500;
        scene.add(hemiLight);

        var light = new THREE.DirectionalLight(0xff9090, 1);
        light.position.set(0, 1, 0).normalize();
        //light.castShadow = true;
        //light.shadowDarkness = 0.5;
        //light.shadowCameraVisible = true;
        scene.add(light);

        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, 0, -1).normalize();
        scene.add(light);



        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        containerEle.append(stats.domElement);
        var axes = new THREE.AxisHelper(1000);
        scene.add(axes);


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




    //

    function animate() {

        requestAnimationFrame(animate);

        render();
        stats.update();
        controls.update();

    }

    function render() {

        //theta += 0.1;

        //camera.position.x = 500 * Math.sin(THREE.Math.degToRad(theta));
        //camera.position.y = -100;
        camera.position.z = 2000;

        camera.lookAt(scene.position);

        renderer.render(scene, camera);


    }

    return function (canvas) {
        animationInit(canvas);
        animate();
        this.scene = scene;
        this.camera = camera;
        this.renderUpdates = renderUpdates;

    };


});
