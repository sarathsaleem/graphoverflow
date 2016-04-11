/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define,THREE, brackets: true, $, window, navigator , clearInterval , setInterval, d3, Float32Array*/

define(['libs/three'], function () {

    "use strict";

    var Table = function (data) {

        var that = this;

        this.elements = data.elements;
        this.screen = null;
        this.stage =  new THREE.Group()
        var elementsBox = [],
            elementsRefs = [],
            elementsPos = [],
            elementsGroup = [],
            elementsGropPos = [];
        var raycaster = new THREE.Raycaster(),
            mouse = new THREE.Vector2(),
            INTERSECTED,
            currentNumber = null;

        this.activeElement = null;
        this.activeNumber = 0;
        var cbs = [];
        this.subscribe = function (cb) {
            cbs.push(cb);
        };

        function rnd(min, max) {
            return (Math.random() * (max - min + 1)) + min;
        }

        this.addAtomCenterAnimation = function () {


        };


        this.addElements = function (elements, screen) {
            this.screen = screen;
            var scene = screen.scene,
                dataelemnts = elements,
                that = this;

            var createElementOutterBox = (function () {
                var geo = new THREE.SphereGeometry(65, 20, 20),
                    color = new THREE.Color(),
                    w = 140,
                    h = 180,
                    xMinus = 1330,
                    yPlus = 900;

                return function (aNumber, num) {
                    var sphere = new THREE.Mesh(geo, new THREE.MeshBasicMaterial());
                    sphere.position.x = (dataelemnts[aNumber][3] * w) - xMinus;
                    sphere.position.y = -(dataelemnts[aNumber][4] * h) + yPlus;
                    sphere.position.z = 0;
                    sphere.aNumber = num + 1;

                    var box = new THREE.BoxHelper(sphere);
                    box.name = "boxHelper";
                    box.material = new THREE.LineBasicMaterial({
                        color: 0xffffff,
                        opacity: 0.25,
                        transparent: true
                    });
                    box.aNumber = num + 1;

                    /* var positions = box.geometry.attributes.position.array,
                        colors = new Float32Array(positions.length);

                    for (var i = 0, i3 = 0; i < positions.length; i++, i3 += 3) {
                        color.setHex(0xffffff);
                        colors[i3 + 0] = color.r;
                        colors[i3 + 1] = color.g;
                        colors[i3 + 2] = color.b;
                    }
                    box.geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));*/

                    elementsBox.push(box);
                    elementsRefs.push(sphere); //for mouse hover raycaster
                    elementsPos.push(sphere.position);

                    return box;
                };

            }());

            var createText = (function () {
                var geo = new THREE.PlaneBufferGeometry(100, 100, 1, 1);
                return function (aNumber, i) {
                    var material = getMaterial(elements[aNumber], i + 1);
                    var textMesh1 = new THREE.Mesh(geo, material);

                    textMesh1.position.x = elementsPos[i].x;
                    textMesh1.position.y = elementsPos[i].y;
                    textMesh1.position.z = 0;

                    //scene.add(textMesh1);
                    return textMesh1;

                };
            }());

            var getMaterial = function (element, n) {

                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                canvas.width = 128;
                canvas.height = 128;

                ctx.beginPath();
                ctx.font = "Bold 64px Arial";
                ctx.fillStyle = "#FFF183";
                ctx.textAlign = 'center';
                ctx.fillText(element[0], 64, 70);
                ctx.font = "Bold 20px Arial";
                ctx.fillText(element[1], 64, 110);
                ctx.font = "Bold 15px Arial";
                ctx.fillStyle = "#ffffff";
                ctx.fillText(element[2], 64, 125);
                ctx.font = "Bold 25px Arial";
                ctx.fillStyle = "#ffffff";
                ctx.fillText(n, 105, 20);
                //ctx.fillText(user.name, 0, 100);
                // canvas contents will be used for a texture
                var texture = new THREE.Texture(canvas);
                texture.needsUpdate = true;

                var material = new THREE.MeshLambertMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                    depthTest: true,
                    transparent: true
                });

                return material;
            };

            Object.keys(elements).forEach(function (aNumber, i) {

                var elementGroup = new THREE.Group();
                elementGroup.aNumber = aNumber;

                var box = createElementOutterBox(aNumber, i);
                var text = createText(aNumber, i);
                elementGroup.add(box);
                elementGroup.add(text);

                elementsGroup.push(elementGroup);

                elementGroup.position.setZ(rnd(-10000, 10000));
                that.stage.add(elementGroup);
            });

            scene.add(this.stage);

            setTimeout(function () {
                elementsGroup.forEach(function (group, i) {
                    new TWEEN.Tween(group.position).to({
                        z: 0
                    }, 5000).easing(TWEEN.Easing.Exponential.Out).start();
                });
            }, 1000);


            var ele = screen.renderer.domElement;

            function onDocumentMouseMove(event) {
                event.preventDefault();
                var viewportOffset = ele.getBoundingClientRect(); //FIXME: calculate only on resize
                // these are relative to the viewport
                var top = viewportOffset.top;
                var left = viewportOffset.left;
                var cX = event.clientX - left,
                    cY = event.clientY - top;

                mouse.x = (cX / viewportOffset.width) * 2 - 1;
                mouse.y = -(cY / viewportOffset.height) * 2 + 1;
                mouse.cx = cX;
                mouse.cy = cY;

            }


            function onDocumentClick() {
                if (currentNumber) {
                    that.clickElement(currentNumber);
                }
            }

            $(ele).on('mousemove', onDocumentMouseMove);
            $(ele).on('click', onDocumentClick);


        };
        this.hoverElement = function (elementBox, mouse) {
            var that = this;
            if (elementBox) {
                this.activeElement = elementBox;
                this.activeNumber = elementBox.aNumber;
                document.body.style.cursor = 'pointer';
            } else {
                this.activeElement = null;
                this.activeNumber = 0;
                document.body.style.cursor = 'default';
            }

            if (this.activeNumber !== currentNumber) {


                this.addHoverEffect(this.activeNumber);

                cbs.forEach(function (cb) {
                    cb(that.activeNumber, mouse);
                });
                currentNumber = this.activeNumber;
            }
        };

        this.addHoverEffect = function (num) {
            var aNumber = Number(num);
            elementsBox.forEach(function (box) {
                box.material.opacity = 0.25;
            });
            if (aNumber !== 0) {
                var box = elementsBox[aNumber - 1];
                box.material.opacity = 1;
            }
        };
        this.higlightElemnts = function (aNumbers) {
            TWEEN.removeAll();
            if (aNumbers) {

                elementsGroup.forEach(function (group) {
                    group.traverse(function (node) {
                        if (node.material && node.name !== 'boxHelper') {
                            node.material.opacity = 0.25;
                        }
                    });
                });

                aNumbers.forEach(function (aNumber) {

                    var element = elementsGroup[aNumber - 1];
                    var z = element.position.z;
                    new TWEEN.Tween(element.position).to({
                        z: z + 100
                    }, 1500).easing(TWEEN.Easing.Exponential.Out).start();

                    element.traverse(function (node) {
                        if (node.material && node.name !== 'boxHelper') {
                            var opacity = {
                                opacity: node.material.opacity
                            };
                            new TWEEN.Tween(opacity).to({
                                opacity: 1
                            }, 1500).easing(TWEEN.Easing.Exponential.Out).onUpdate(function () {
                                node.material.opacity = this.opacity;
                            }).start();
                        }
                    });

                });
            } else {
                elementsGroup.forEach(function (group) {

                    var element = elementsGroup[group.aNumber - 1];
                    new TWEEN.Tween(element.position).to({
                        z: 0
                    }, 1500).easing(TWEEN.Easing.Exponential.Out).start();

                    group.traverse(function (node) {
                        if (node.material && node.name !== 'boxHelper') {
                            var opacity = {
                                opacity: node.material.opacity
                            };
                            new TWEEN.Tween(opacity).to({
                                opacity: 1
                            }, 1000).easing(TWEEN.Easing.Exponential.Out).onUpdate(function () {
                                node.material.opacity = this.opacity;
                            }).start();
                        }
                    });
                });
            }

        };

        var inScreenChnage = false;
        this.clickElement = function (currentElement) {
            if (inScreenChnage) {
                return;
            }

            inScreenChnage = true;
            elementsGroup.forEach(function (group, i) {
                new TWEEN.Tween(group.position).to({
                    z: 5000
                }, 5000).easing(TWEEN.Easing.Exponential.Out).start();
            });
            setTimeout(function() {
                that.stage.visible = false;
            }, 5000);
        };

        /**
         *
         *
         */
        this.render = function () {
            //that.lineGlow.material.uniforms.viewVector.value = new THREE.Vector3().subVectors( that.screen.camera.position, that.lineGlow.position );
            raycaster.setFromCamera(mouse, that.screen.camera);
            var intersects = raycaster.intersectObjects(elementsRefs);
            if (intersects.length > 0) {
                if (INTERSECTED != intersects[0].object) {
                    INTERSECTED = intersects[0].object;
                    that.hoverElement(INTERSECTED, mouse);
                }
            } else {
                that.hoverElement(false, mouse);
                INTERSECTED = null;
            }
        };

        this.renderUpdates = [this.render];


    };

    Table.prototype.addTable = function (scene) {
        this.addElements(this.elements, scene);
    };

    return Table;

});
