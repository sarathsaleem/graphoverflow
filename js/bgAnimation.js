define(['utils/utils', 'd3', 'libs/three', 'libs/stats', 'libs/tween'], function (_util, ignore) {

    "use strict";

    function rnd(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function buildParticleWorld(containerId) {

        var containerEle = $("#"+containerId),
            camera, scene, renderer, stats, controls, particles, particleSystem;

        var particleLength = 1000;


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

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        containerEle.append(stats.domElement);


        particles = new THREE.BufferGeometry();

        var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
        hemiLight.color.setHSL(0.6, 0.75, 0.5);
        hemiLight.groundColor.setHSL(0.095, 0.5, 0.5);
        hemiLight.position.set(0, 500, 0);
        scene.add(hemiLight);

        var ambLight = new THREE.AmbientLight(0x404040);
        scene.add(ambLight);


        var gridColor = d3.scale.linear().domain([0, 20]).range(["#d2f428", "#11bf1d"]);

        function init() {

            generateParticles(particleLength);

        }

        function animate() {

            requestAnimationFrame(animate);
            TWEEN.update();
            controls.update();
            renderParticles();

            //stats.update(); :debug

        }

        function renderParticles() {

            particles.attributes.position.needsUpdate = true;
            particles.attributes.customColor.needsUpdate = true;

            renderer.render(scene, camera);
            particleSystem.rotation.y += 0.0005;
            particleSystem.rotation.x += 0.0005;
            particleSystem.rotation.z += 0.0005;

        }


        function generateParticles(particleLen) {


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
                    value: new THREE.TextureLoader().load("../templates/images/g6-git/ball.png")
                }
            };

            var positions = new Float32Array(particleLen * 3);
            var colors = new Float32Array(particleLen * 3);
            var sizes = new Float32Array(particleLen);


            //for (var i = 0; i < particleLen; i++) {
            var color = new THREE.Color();

            for (var i = 0, i3 = 0; i < particleLen; i++, i3 += 3) {

                positions[i3 + 0] = Math.random() * 1000 - 500;
                positions[i3 + 1] = Math.random() * 1000 - 500;
                positions[i3 + 2] = Math.random() * 1000 - 500;

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
        }
    }

    return buildParticleWorld;

});
