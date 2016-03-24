/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, d3, THREE, define, brackets: true, $, window */

define(['../g9/electrons', 'libs/three', 'd3'], function (Electrons, ignore) {
    "use strict";

    var Atom = function (data) {


        this.electrons = new Electrons(data);

        var nucelionsPos = [];
        var coolingFactor = 1;
        var nucleusCenter = {
            x: 0,
            y: 0,
            z: 0
        };

        var nuleionsUi = [];

        this.protonRadius = 50;

        this.normalizeNucleus = function (nodes) {
            if (coolingFactor === 0) {
                return;
            }

            for (var i = 0; i < nodes.length; i++) {

                nodes[i].x = nodes[i].x + (nucleusCenter.x - nodes[i].x) * (0.1 * coolingFactor);
                nodes[i].y = nodes[i].y + (nucleusCenter.y - nodes[i].y) * (0.1 * coolingFactor);
                nodes[i].z = nodes[i].z + (nucleusCenter.z - nodes[i].z) * (0.1 * coolingFactor);

                for (var j = 0; j < nodes.length; j++) {
                    if (i === j) continue;
                    var r = nodes[i].radius + nodes[j].radius;
                    var x = nodes[i].x - nodes[j].x,
                        y = nodes[i].y - nodes[j].y,
                        z = nodes[i].z - nodes[j].z;

                    var dist = Math.sqrt(x * x + y * y + z * z);

                    if (dist < r) {
                        dist = (dist - r) / dist * 0.5;

                        nodes[i].x -= x *= dist;
                        nodes[i].y -= y *= dist;
                        nodes[i].z -= z *= dist;

                        nodes[j].x += x;
                        nodes[j].y += y;
                        nodes[j].z += z;
                    }
                }

                nuleionsUi[i].position.x = nodes[i].x;
                nuleionsUi[i].position.y = nodes[i].y;
                nuleionsUi[i].position.z = nodes[i].z;

            }

            if (coolingFactor > 0) {
                coolingFactor -= 0.001;
            } else {
                coolingFactor = 0;
            }

        };

        this.createNucleus = function (atomicNumber) {

            var generatePoints = function (point, radius, protonsRadius) {
                var points = [],
                    radian = Math.PI / 180,
                    vspace = 360 / Math.sqrt(point),
                    hspace = vspace;
                for (var i = 1; i < 360; i += vspace) {
                    for (var angle = 1; angle < 360; angle += hspace) {
                        var pt = {};
                        var x = Math.sin(radian * i) * radius;
                        pt.x = Math.cos(angle * radian) * x;
                        pt.y = Math.cos(radian * i) * radius;
                        pt.z = Math.sin(angle * radian) * x;

                        pt.radius = protonsRadius;
                        points.push(pt);
                    }
                }
                return points.slice(points.length - point);
            };


            var sphereRadius = 10;
            var particles = atomicNumber*2;//protons and neutrons
            nucelionsPos = generatePoints(particles, sphereRadius, this.protonRadius);
        };

        this.ui_addNucleus = function (scene) {

            var geo = new THREE.SphereGeometry(this.protonRadius, 20, 20);

            var colors = ['#FF0000', '#004DFF'];

            for (var i = 0; i < nucelionsPos.length; i++) {

                var sphere = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({
                    color: colors[i % colors.length]
                }));

                var vec = new THREE.Vector3(nucelionsPos[i].x, nucelionsPos[i].y, nucelionsPos[i].z);

                sphere.position.add(vec);

                nuleionsUi.push(sphere);
                scene.add(sphere);
            }


        };

        this.moveTo = function (pos) {
            coolingFactor = 1;
            nucleusCenter.x = pos.x;
            nucleusCenter.y = pos.y;
            nucleusCenter.z = pos.z;
        };

        var that = this;

        this.render = function () {
            that.normalizeNucleus(nucelionsPos);
        };

        this.renderUpdates = [this.render].concat(this.electrons.renderUpdates);

        this.create = function (atomicNumber, scene) {
            this.createNucleus(atomicNumber);
            this.ui_addNucleus(scene);
        };

    };

    return Atom;

});
