/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define,THREE, brackets: true, $, window, navigator , clearInterval , setInterval, d3, Float32Array*/

define(['libs/three','libs/optimer_regular.typeface','libs/optimer_bold.typeface','libs/FontUtils','libs/TextGeometry','utils/utils'], function (_util) {

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
                var geo = new THREE.SphereGeometry(50, 20, 20),
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

                Object.keys(elements).forEach(function (aNumber) {
                    var sphere = new THREE.Mesh(geo, new THREE.MeshBasicMaterial());
                    sphere.position.x = (elements[aNumber][3] * w) - xMinus;
                    sphere.position.y = -(elements[aNumber][4] * h) + yPlus;
                    sphere.position.z = 0;

                    var box = new THREE.BoxHelper(sphere);
                    box.material = material;

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
                var material = new THREE.MeshFaceMaterial( [
                    new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } ), // front
                    new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.SmoothShading } ) // side
                ] );

                Object.keys(elements).forEach(function (aNumber,i) {
                    var text = elements[aNumber][1],
                        height = 20,
                        size = 70,
                        hover = 30,
                        curveSegments = 4,
                        bevelThickness = 2,
                        bevelSize = 1.5,
                        bevelSegments = 3,
                        bevelEnabled = true,

                        font = "optimer", // helvetiker, optimer, gentilis, droid sans, droid serif
                        weight = "bold", // normal bold
                        style = "normal"; // normal italic

                    var textGeo = new THREE.TextGeometry(text, {
                        size: size,
                        height: height,
                        curveSegments: curveSegments,

                        font: font,
                        weight: weight,
                        style: style,

                        bevelThickness: bevelThickness,
                        bevelSize: bevelSize,
                        bevelEnabled: bevelEnabled,

                        material: 0,
                        extrudeMaterial: 1

                    });
                    textGeo.computeBoundingBox();
                    textGeo.computeVertexNormals();
                   // var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
                    var textMesh1 = new THREE.Mesh( textGeo, material );

                    textMesh1.position.x = elementPos[i].x;
                    textMesh1.position.y = elementPos[i].y;
                    textMesh1.position.z = 0;

                    scene.add(textMesh1);

                });
            }


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
