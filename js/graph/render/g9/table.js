/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define,THREE, brackets: true, $, window, navigator , clearInterval , setInterval, d3, Float32Array*/

define(['libs/three'], function () {

    "use strict";

    var Table = function (data) {

        var that = this;

        this.elements = data.elements;
        this.screen = null;
        this.addAtomCenterAnimation = function () {


        };


        this.addElements = function (elements, screen) {
            var scene = screen.scene;



            function addElementOutterBox(elements, scene) {
                var geo = new THREE.SphereGeometry(70, 20, 20),
                    material = new THREE.LineBasicMaterial({
                        color: 0xffffff,
                        opacity: 0.5,
                        transparent: true,
                        linewidth: 1,
                        vertexColors: THREE.VertexColors
                    }),
                    color = new THREE.Color(),
                    elementsPos = [],
                    w = 140,
                    h = 180,
                    xMinus = 1330,
                    yPlus = 990;

                Object.keys(elements).forEach(function (aNumber, num) {
                    var sphere = new THREE.Mesh(geo, new THREE.MeshBasicMaterial());
                    sphere.position.x = (elements[aNumber][3] * w) - xMinus;
                    sphere.position.y = -(elements[aNumber][4] * h) + yPlus;
                    sphere.position.z = 0;

                    var box = new THREE.BoxHelper(sphere);
                    box.material = material;
                    box.aNumber = num;

                    var positions = box.geometry.attributes.position.array,
                        colors = new Float32Array(positions.length);

                    for (var i = 0, i3 = 0; i < positions.length; i++, i3 += 3) {
                        color.setHex(Math.random() * 0xffffff);
                        colors[i3 + 0] = color.r;
                        colors[i3 + 1] = color.g;
                        colors[i3 + 2] = color.b;
                    }
                    box.geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
                    scene.add(box);
                    elementsPos.push(sphere.position);
                });

                return elementsPos;
            }

            function createText(elements, scene, elementPos) {


                var geo = new THREE.PlaneBufferGeometry(100, 100, 1, 1);
                Object.keys(elements).forEach(function (aNumber,i) {
                    var material = getMaterial(elements[aNumber], i+1);
                    var textMesh1 = new THREE.Mesh( geo, material );

                    textMesh1.position.x = elementPos[i].x;
                    textMesh1.position.y = elementPos[i].y;
                    textMesh1.position.z = 0;

                    scene.add(textMesh1);

                });
            }

            var getMaterial = function (element, n) {

                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                canvas.width = 128;
                canvas.height = 128;

                ctx.beginPath();
                ctx.font = "Bold 64px Arial";
                ctx.fillStyle = "#FFFFFF";
                ctx.textAlign = 'center';
                ctx.fillText(element[0], 64, 70);
                ctx.font = "Bold 20px Arial";
                ctx.fillText(element[1], 64, 110);
                ctx.font = "Bold 15px Arial";
                ctx.fillStyle = "#00ffd8";
                ctx.fillText(element[2], 64, 125);
                ctx.font = "Bold 25px Arial";
                ctx.fillStyle = "#00ff27";
                ctx.fillText(n, 105, 20);
                //ctx.fillText(user.name, 0, 100);
                // canvas contents will be used for a texture
                var texture = new THREE.Texture(canvas);
                texture.needsUpdate = true;

                var material = new THREE.MeshLambertMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                    depthTest: true,
                    transparent:true
                });

                return material;
            };


            var elementsPos = addElementOutterBox(elements, scene);
            createText(elements, scene, elementsPos);


        };

        this.atomCenterAnimation = function (screen) {


            //var geometry = new THREE.BoxHelper(15,15,15);

            var material = new THREE.LineBasicMaterial({
                color: 0xffffff,
                opacity: 1,
                linewidth: 3,
                vertexColors: THREE.VertexColors
            });


            //circleGeometry.vertices.shift();

            var sphere = new THREE.SphereGeometry(10);
            var object = new THREE.Mesh(sphere, material);
            var box = new THREE.BoxHelper(object);

            screen.scene.add(box);


        };
        /**
         *
         *
         */
        this.render = function () {
            //that.lineGlow.material.uniforms.viewVector.value = new THREE.Vector3().subVectors( that.screen.camera.position, that.lineGlow.position );
        };

        this.renderUpdates = [this.render];


    };

    Table.prototype.addTable = function (scene) {
        this.addElements(this.elements, scene);
        //this.atomCenterAnimation(scene);
    };

    return Table;

});
