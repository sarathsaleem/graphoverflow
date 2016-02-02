/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define,THREE, brackets: true, $, window, navigator , clearInterval , setInterval, d3*/

define(['utils/utils'], function (_util) {

    "use strict";

    var Table = function (data) {

        var that = this;

        this.elements = data.elements;
        var geo = new THREE.SphereGeometry(50, 20, 20),
            material = new THREE.MeshLambertMaterial({
                color: '#00ff1d'
            });
        this.lineGlow = null;
        this.screen = null;

        this.addAtomCenterAnimation = function () {


        };


        this.addElements = function (elements, scene) {

            Object.keys(elements).forEach(function (aNumber) {
                var sphere = new THREE.Mesh(geo, material);
                sphere.position.x = (elements[aNumber][3] * 140) - 1330;
                sphere.position.y = -(elements[aNumber][4] * 180) + 990;
                sphere.position.z = 0;
                scene.add(sphere);
            });
        };

        this.atomCenterAnimation = function (screen) {

            var material = new THREE.LineBasicMaterial({
                color: "#0062e8"
            });
            var segments = 100;

            var circleGeometry = new THREE.CircleGeometry(500, segments);
            // Remove center vertex
            circleGeometry.vertices.shift();

            var line = new THREE.Line(circleGeometry, material);
            screen.scene.add(line);

            this.screen = screen;

            // create custom material from the shader code above
            //   that is within specially labeled script tags
            var customMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    "c": {
                        type: "f",
                        value: 1.0
                    },
                    "p": {
                        type: "f",
                        value: 1.4
                    },
                    glowColor: {
                        type: "c",
                        value: new THREE.Color(0xffff00)
                    },
                    viewVector: {
                        type: "v3",
                        value: screen.camera.position
                    }
                },
                vertexShader: document.getElementById('vertexShader').textContent,
                fragmentShader: document.getElementById('fragmentShader').textContent,
                side: THREE.FrontSide,
                blending: THREE.AdditiveBlending,
                transparent: true
            });

            var circleGeometry = new THREE.CircleGeometry(500, segments);
            // Remove center vertex
            circleGeometry.vertices.shift();


            this.lineGlow = new THREE.Mesh( circleGeometry, customMaterial.clone() );
            this.lineGlow.position.copy(line.position);
            this.lineGlow.scale.multiplyScalar(1.2);
            screen.scene.add( this.lineGlow );





        };
          /**
         *
         *
         */
        this.render = function () {
             that.lineGlow.material.uniforms.viewVector.value = new THREE.Vector3().subVectors( that.screen.camera.position, that.lineGlow.position );

        };

        this.renderUpdates = [this.render];


    };

    Table.prototype.addTable = function (scene) {
        //this.addElements(this.elements, scene);
        this.atomCenterAnimation(scene);
    };

    return Table;

});
