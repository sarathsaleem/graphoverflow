/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator,document */

define(function () {
    "use strict";

    var utils = {
        hasLocalStorage: function () {
            if ('localStorage' in window && window.localStorage !== null) {
                return window.localStorage;
            } else {
                console.error("GO: Localstorage is not supported by the browser. You may experience perfomance issues");
                return false;
            }

        },

        /*
            createGradient($('svg')[0],'MyGradient',[
                  {offset:'5%', 'stop-color':'#f60'},
                  {offset:'95%','stop-color':'#ff6'}
                ]);
                OR
            createGradient($('svg')[0],'MyGradient',['red','blue']);
        */
        addGradient: function (svg, id, stops) {

            var svgNS = svg.namespaceURI;
            var grad = document.createElementNS(svgNS, 'linearGradient');
            grad.setAttribute('id', 'grad-' + id);

            function getOffset(n) {
                if (n === 0 || n === 1) {
                    return [0];
                }
                return Array.apply(null, new Array(n)).map(function (val, i) {
                    return 100 / (n - 1) * i;
                });
            }
            if (stops[0] instanceof Object) {
                stops.forEach(function (props) {
                    var stop = document.createElementNS(svgNS, 'stop');
                    var attr;
                    for (attr in props) {
                        if (props.hasOwnProperty(attr)) {
                            stop.setAttribute(attr, props[attr]);
                        }
                    }
                    grad.appendChild(stop);
                });
                //convert colors into stops
            } else if (typeof stops[0] === 'string') {
                var offsets = getOffset(stops.length);
                stops.forEach(function (color, i) {
                    var stop = document.createElementNS(svgNS, 'stop');
                    stop.setAttribute('offset', offsets[i] + '%');
                    stop.setAttribute('stop-color', color);
                    grad.appendChild(stop);
                });
            }
            var defs = svg.querySelector('defs') || svg.insertBefore(document.createElementNS(svgNS, 'defs'), svg.firstChild);
            return defs.appendChild(grad);

        },
        addImage: function (svg, id, path, w, h) {
            var svgNS = svg.namespaceURI,
                pattern = document.createElementNS(svgNS, 'pattern');
            var XLink_NS = 'http://www.w3.org/1999/xlink';
            pattern.setAttribute('x', 0);
            pattern.setAttribute('y', 0);
            pattern.setAttribute('id', 'image-' + id);
            pattern.setAttribute('width', w);
            pattern.setAttribute('height', h);


            var image = document.createElementNS(svgNS, 'image');
            image.setAttribute('x', 0);
            image.setAttribute('y', 0);
            image.setAttribute('width', w);
            image.setAttribute('height', h);
            image.setAttributeNS(XLink_NS, 'xlink:href', path);


            pattern.appendChild(image);

            var defs = svg.querySelector('defs') || svg.insertBefore(document.createElementNS(svgNS, 'defs'), svg.firstChild);
            return defs.appendChild(pattern);

        },
        addClipPathCircle: function (svg, id, radius) {
            var svgNS = svg.namespaceURI,
                clipPath = document.createElementNS(svgNS, "clipPath");
            clipPath.setAttribute('id', id);

            var circle = document.createElementNS(svgNS, 'circle');
            circle.setAttribute("r", radius);
            circle.setAttribute("cx", 50);
            circle.setAttribute("cy", 50);
            clipPath.appendChild(circle);

            var defs = svg.querySelector('defs') || svg.insertBefore(document.createElementNS(svgNS, 'defs'), svg.firstChild);
            return defs.appendChild(clipPath);

        },
        getTagColors: function () {

            var colors = {
                "c#": "#68217A",
                "java": "#C50000,#DF0000,#FE0000",
                "javascript": "#F8DC3D",
                "php": "#777BB4",
                "android": "#A4C439",
                "python": "#3779AF,#FFCC3B",
                "jquery": "#0769AD",
                "c++": "#A1BCDF",
                "html": "#E34C26,#F06529",
                "html5": "#E34C26,#F06529",
                "mysql": "#93AFC0,#F8900C",
                "asp.net": "#0054A3",
                ".net": "#0054A3",
                "asp.net-mvs": "#0054A3",
                "wpf": "#0054A3",
                "ios": "#585AD7,#5998EB,#5AC8FA",
                "iphone": "#E0E0E1,#7B7B7B",
                "objective-c": "#323F50",
                "ruby": "#D51F07,#AF1401,#991301",
                "ruby-on-rails": "#D51F07,#AF1401,#991301",
                "sql-server": "#DFE0E1,#8C9197,#A0041E,#FA4C44",
                "ajax": "#005A9C",
                "xml": "#005A9C",
                "django": "#7FB83D,#234F32,#092E20",
                "linux": "#2E2C2C,#E7E8E9,#FDD23C"
            };

            return colors;
        }
    };



    return utils;

});
