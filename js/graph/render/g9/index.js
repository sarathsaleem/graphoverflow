/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator , clearInterval , setInterval, d3*/

define(['utils/utils', 'd3', 'libs/three', 'libs/stats', 'graph/render/g9/d3.force3d'], function (_util, ignore) {

    "use strict";

    function render(data, canvas) {

        // https://gist.github.com/ZJONSSON/2720730

        /*global THREE, document, window, TWEEN, Stats,d3 */




        var stats;
        var camera, scene, renderer;

        var mouse = new THREE.Vector2(),
            controls;
        var radius = 50,
            theta = 0;
        var nodes, spheresNodes = [];


        var clock = new THREE.Clock();


        function rnd(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function collide(node) {
            var r = node.radius + 16,
                nx1 = node.x - r,
                nx2 = node.x + r,
                ny1 = node.y - r,
                ny2 = node.y + r,
                nz1 = node.z - r,
                ny2 = node.z + r;
            return function (quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== node)) {
                    var x = node.x - quad.point.x,
                        y = node.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = node.radius + quad.point.radius;
                    if (l < r) {
                        l = (l - r) / l * .5;
                        node.x -= x *= l;
                        node.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            };
        }


        function initSpherePack(canvas) {

            var containerEle = $(canvas);

            var SCREEN_WIDTH = containerEle.innerWidth();
            var SCREEN_HEIGHT = containerEle.innerHeight();


            nodes = d3.range(50).map(function () {
                return {
                    radius: rnd(radius, 100)
                };
            });
            var root = nodes[0];

            root.radius = 0;
            root.fixed = true;

            /*function (d, i) {
                    return i ? 0 : -2000;
                }*/
            var links = [];
            for (var i =0; i < nodes.length;i++) {
                 for (var j =0; j < nodes.length;j++) {
                    links.push({"source":i,"target":j});
                 }
            }

            var force = d3.layout.force3d()
                .gravity(0.05)
                .charge(function (d, i) {
                    return i ? 0 : -2000;
                })
                //.links(links)
                .nodes(nodes)
                //.linkDistance(20)
                .size([SCREEN_WIDTH, SCREEN_HEIGHT]);

            force.start();

            return nodes;
        }

        var sphereSize = 50,
            sphereCenters = [];
        var R = 1.0;

        function arrange () {
            for(var i = 0; i < sphereCenters.length; i++) {
                for(var j = 0; j < sphereCenters.length; j++) {
                    if(i === j) continue;
                    //calculate the distance between sphereCenters[i] and sphereCenters[j]
                    var dist = new THREE.Vector3().copy(sphereCenters[i]).sub(sphereCenters[j]);
                    if(dist.length() < sphereSize) {
                         //move the center of this sphere to to compensate
                         //how far do we have to move?
                         var mDist = sphereSize - dist.length();
                         //perturb the sphere in direction of dist magnitude mDist
                         var mVec = new THREE.Vector3().copy(dist).normalize();
                         mVec.multiplyScalar(mDist);
                         //offset the actual sphere
                         sphereCenters[i].add(mVec).normalize();

                    }
                }
            }
        }

       function spaceMe (nodes) {
            for(var i = 0; i < nodes.length; i++) {
                for(var j = 0; j < nodes.length; j++) {
                    if(i === j) continue;
                    //calculate the distance between sphereCenters[i] and sphereCenters[j]
                    var dist = new THREE.Vector3().copy(nodes[i]).sub(nodes[j]);
                    if(dist.length() < sphereSize) {
                         //move the center of this sphere to to compensate
                         //how far do we have to move?
                         var mDist = sphereSize - dist.length();
                         //perturb the sphere in direction of dist magnitude mDist
                         var mVec = new THREE.Vector3().copy(dist).normalize();
                         mVec.multiplyScalar(mDist);
                         //offset the actual sphere
                         nodes[i].add(mVec).normalize().multiplyScalar(R);

                    }
                }

                spheresNodes[i].position.x = nodes[i].x;
                spheresNodes[i].position.y = nodes[i].y;
                spheresNodes[i].position.z = nodes[i].z;

            }
        }



        function init(canvas) {

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

            var directionalLight = new THREE.DirectionalLight("#14bc22", 1.475);
            directionalLight.position.set(100, 100, -100);
            scene.add(directionalLight);


            var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.25);
            hemiLight.color.setHSL(0.6, 1, 0.75);
            hemiLight.groundColor.setHSL(0.1, 0.8, 0.7);
            hemiLight.position.y = 500;
            scene.add(hemiLight);

            // SKYDOME



            renderer.gammaInput = true;
            renderer.gammaOutput = true;


            var geo = new THREE.SphereGeometry(radius);

            var nodes = initSpherePack(canvas);

            for (var i = 0; i < nodes.length; i++) {
                var sphere = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({
                    color: Math.random() * 0xffffff
                }));


                var vec = new THREE.Vector3(nodes[i].x,nodes[i].y,nodes[i].y);//.normalize();
                var sphereCenter = new THREE.Vector3().copy(vec).multiplyScalar(R);
                sphereCenter.radius = 50;// nodes[i].radius; // RANDOM SPHERE SIZE, plug in your sizes here
                sphereCenters.push(sphereCenter);

                for (var attrname in sphereCenter) { nodes[i][attrname] = sphereCenter[attrname]; }


                sphere.position.add(vec);

                var scale = nodes[i].radius / radius;

                if (scale === 0) {
                    scale = .001;
                }

                sphere.scale.x = scale;
                sphere.scale.y = scale;
                sphere.scale.z = scale;


                /*tween = new TWEEN.Tween(sphere.position).to({
                    x: rnd(-1000, 1000),
                    y: rnd(-1000, 1000),
                    z: -1000
                }, rnd(5000, 6000)).delay(rnd(4000, 7000)).easing(TWEEN.Easing.Elastic.Out);*/
                //tween.start();

                spheresNodes.push(sphere);
                scene.add(sphere);


            }



            stats = new Stats();
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.top = '0px';
            containerEle.append(stats.domElement);
            var axes = new THREE.AxisHelper(1000);
            scene.add( axes );

            /* d3.select(canvas).on("mousemove", function () {
                var p1 = d3.mouse(this);
                console.log(p1, spheresNodes[1].position);
                root.px = p1[0];
                root.py = p1[1];
                force.resume();
            });*/

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
            controls.update();
            stats.update();

        }

        function render() {

            theta += 0.1;

            //camera.position.x = radius * Math.sin(THREE.Math.degToRad(theta));
            //camera.position.y = -100;
            camera.position.z = 2000;

            camera.lookAt(scene.position);

            // find intersections


            //var q = d3.geom.quadtree(nodes);

            //for (var i = 1; i < nodes.length; ++i) {
                //q.visit(collide(nodes[i]));
             spaceMe(nodes);
             //   spheresNodes[i].position.x = nodes[i].x;
             //   spheresNodes[i].position.y = nodes[i].y;
             //   spheresNodes[i].position.z = nodes[i].z;

          //  }


            renderer.render(scene, camera);


        }


        init(canvas);
        animate();



    }
    return render;

});
