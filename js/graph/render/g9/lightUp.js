/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, d3, THREE, define, brackets: true, $, window */

define(['libs/three', 'libs/dat.gui'], function (ignore) {
    "use strict";


    var LightUp = function (s, container) {

        var scene = s;

        function handleColorChange(color) {
            return function(value) {
                if (typeof value === "string") {
                    value = value.replace('#', '0x');
                }
                color.setHex(value);
            };
        }


        this.addAmbientLight = function (color) {
            var light = new THREE.AmbientLight(color);
            scene.add(light);
            return light;
        };
        this.addDirectionalLight = function (color, intensity, pos) {
            var light = new THREE.DirectionalLight(color, intensity);
            light.position.set(pos.x, pos.y, pos.z);
            scene.add(light);
            return light;
        };
        this.addHemisphereLight = function (skyColorHex, groundColorHex, intensity) {
            var light = new THREE.HemisphereLight(skyColorHex, groundColorHex, intensity)
            scene.add(light);
            return light;
        };
        this.addPointLight = function (hex, intensity, distance, decay, pos) {
            var light = new THREE.PointLight(hex, intensity, distance, decay);
            light.position.set(pos.x, pos.y, pos.z);
            scene.add(light);
            return light;
        };

        this.addSpotLight = function (color, pos, castShadow) {
            var light = new THREE.SpotLight(0xffffff);
            light.position.set(pos.x, pos.y, pos.z);

            light.castShadow = castShadow;

            light.shadowMapWidth = 1024;
            light.shadowMapHeight = 1024;

            light.shadowCameraNear = 500;
            light.shadowCameraFar = 4000;
            light.shadowCameraFov = 30;

            scene.add(light);
            return light;
        };

        var gui = new dat.GUI({ autoPlace: false });


       /* var light = this.addAmbientLight("#595959");
        var f1 = gui.addFolder('AmbientLight');
        f1.addColor({ color : light.color.getHex() }, 'color').onChange(handleColorChange(light.color));
*/
        var light2 = this.addDirectionalLight("#e8e8e8", 0.5, { x: 0 , y : 0 , z :1});
        var f2 = gui.addFolder('DirectionalLight');
        f2.addColor({ color : light2.color.getHex() }, 'color').onChange(handleColorChange(light2.color));
        f2.add(light2, 'intensity', 0, 1);
        f2.add(light2.position, 'x', -2000, 2000).step(1);
        f2.add(light2.position, 'y', -2000, 2000).step(1);
        f2.add(light2.position, 'z', -2000, 2000).step(1);
        f2.add(light2, 'visible');

         var light3 = this.addDirectionalLight("#e8e8e8", 0.5, { x: 1 , y : 0 , z : 0});
        var f2 = gui.addFolder('DirectionalLight2');
        f2.addColor({ color : light2.color.getHex() }, 'color').onChange(handleColorChange(light2.color));
        f2.add(light3, 'intensity', 0, 1);
        f2.add(light3.position, 'x', -2000, 2000).step(1);
        f2.add(light3.position, 'y', -2000, 2000).step(1);
        f2.add(light3.position, 'z', -2000, 2000).step(1);
        f2.add(light3, 'visible');



        $(container).append(gui.domElement);




    };

    return LightUp;
});
