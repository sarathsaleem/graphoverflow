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

            var helper = new THREE.DirectionalLightHelper( light, 3 );
            //scene.add( helper );
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

            var pointLightHelper = new THREE.PointLightHelper( light, 1 );
            scene.add( pointLightHelper );
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

            var spotLightHelper = new THREE.SpotLightHelper( light );
            scene.add( spotLightHelper );

            return light;
        };

        var gui = new dat.GUI({ autoPlace: false });

        this.lights = [];

       /* var light = this.addAmbientLight("#595959");
        var f1 = gui.addFolder('AmbientLight');
        f1.addColor({ color : light.color.getHex() }, 'color').onChange(handleColorChange(light.color));

*/

        var hemiLight = this.addHemisphereLight(0xffffff, 0xffffff, 1.25);
        hemiLight.color.setHSL(0.6, 1, 0.75);
        hemiLight.groundColor.setHSL(0.1, 0.8, 0.7);
        hemiLight.position.y = 5100;
        var f2 = gui.addFolder('HemisphereLight');
        f2.add(hemiLight, 'visible');
        this.lights.push(hemiLight);


        var light = this.addDirectionalLight("#ffffff", 1, { x: 0 , y : 0 , z :10});
        var f2 = gui.addFolder('DirectionalLight');
        f2.addColor({ color : light.color.getHex() }, 'color').onChange(handleColorChange(light.color));
        f2.add(light, 'intensity', 0, 1);
        f2.add(light.position, 'x', -2000, 2000).step(1);
        f2.add(light.position, 'y', -2000, 2000).step(1);
        f2.add(light.position, 'z', -2000, 2000).step(1);
        f2.add(light, 'visible');
        this.lights.push(light);

        var light = this.addDirectionalLight("#ffffff", 1, { x: 0 , y : 0 , z : -10});
        var f2 = gui.addFolder('DirectionalLight11');
        f2.addColor({ color : light.color.getHex() }, 'color').onChange(handleColorChange(light.color));
        f2.add(light, 'intensity', 0, 1);
        f2.add(light.position, 'x', -2000, 2000).step(1);
        f2.add(light.position, 'y', -2000, 2000).step(1);
        f2.add(light.position, 'z', -2000, 2000).step(1);
        f2.add(light, 'visible');
        this.lights.push(light);


        /***********************************************************************************************/


        var light = this.addDirectionalLight("#ffffff", 1, { x: 0 , y : 0 , z :1500});
        var f2 = gui.addFolder('DirectionalLight3');
        f2.addColor({ color : light.color.getHex() }, 'color').onChange(handleColorChange(light.color));
        f2.add(light, 'intensity', 0, 1);
        f2.add(light.position, 'x', -2000, 2000).step(1);
        f2.add(light.position, 'y', -2000, 2000).step(1);
        f2.add(light.position, 'z', -2000, 2000).step(1);
        f2.add(light, 'visible');
        this.lights.push(light);


        var light = this.addDirectionalLight("#ffffff", 1, { x: 0 , y : 0  , z :-1500});
        var f2 = gui.addFolder('DirectionalLight4');
        f2.addColor({ color : light.color.getHex() }, 'color').onChange(handleColorChange(light.color));
        f2.add(light, 'intensity', 0, 1);
        f2.add(light.position, 'x', -2000, 2000).step(1);
        f2.add(light.position, 'y', -2000, 2000).step(1);
        f2.add(light.position, 'z', -2000, 2000).step(1);
        f2.add(light, 'visible');
        this.lights.push(light);

        var light = new THREE.AmbientLight( 0x404040 ); // soft white light
        var f2 = gui.addFolder('AmbientLight');
        f2.addColor({ color : light.color.getHex() }, 'color').onChange(handleColorChange(light.color));
        f2.add(light, 'visible');
        this.lights.push(light);


        //$(container).append(gui.domElement);

        gui.close();


    };

    return LightUp;
});
