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
                "linux": "#2E2C2C,#E7E8E9,#FDD23C",
                "perl": "#E9F2FB,#A9CBEE,#5A8ACB"
            };

            return colors;
        },
        
        // corrected values from https://github.com/ozh/github-colors/blob/master/colors.json
        gitColors: function () {
            return {
                "ActionScript": "#e3491a",
                "Ada": "#02f88c",
                "Agda": "#467C91",
                "Alloy": "#cc5c24",
                "ANTLR": "#9DC3FF",
                "Arc": "#ca2afe",
                "Arduino": "#bd79d1",
                "ASP": "#6a40fd",
                "AspectJ": "#1957b0",
                "Assembly": "#a67219",
                "ATS": "#1ac620",
                "AutoHotkey": "#6594b9",
                "AutoIt": "#36699B",
                "Boo": "#d4bec1",
                "C": "#555",
                "C#": "#5a25a2",
                "C++": "#f34b7d",
                "Cirru": "#aaaaff",
                "Clean": "#3a81ad",
                "Clojure": "#db5855",
                "CoffeeScript": "#244776",
                "ColdFusion": "#ed2cd6",
                "Common Lisp": "#3fb68b",
                "Component Pascal": "#b0ce4e",
                "CSS": "#563d7c",
                "D": "#fcd46d",
                "Dart": "#98BAD6",
                "DM": "#075ff1",
                "Dogescript": "#cca760",
                "Dylan": "#3ebc27",
                "E": "#ccce35",
                "Eagle": "#3994bc",
                "ECL": "#8a1267",
                "edn": "#db5855",
                "Eiffel": "#946d57",
                "Elixir": "#6e4a7e",
                "Emacs Lisp": "#c065db",
                "Erlang": "#0faf8d",
                "F#": "#b845fc",
                "Factor": "#636746",
                "Fancy": "#7b9db4",
                "Fantom": "#dbded5",
                "FLUX": "#33CCFF",
                "Forth": "#341708",
                "FORTRAN": "#4d41b1",
                "Frege": "#00cafe",
                "Game Maker Language": "#8ad353",
                "Glyph": "#e4cc98",
                "Gnuplot": "#f0a9f0",
                "Go": "#375eab",
                "Gosu": "#82937f",
                "Grammatical Framework": "#ff0000",
                "Groovy": "#e69f56",
                "Harbour": "#0e60e3",
                "Haskell": "#29b544",
                "Haxe": "#f7941e",
                "Hy": "#7891b1",
                "IDL": "#e3592c",
                "Io": "#a9188d",
                "Ioke": "#078193",
                "Java": "#b07219",
                "JavaScript": "#f1e05a",
                "Julia": "#a270ba",
                "KRL": "#f5c800",
                "Lasso": "#2584c3",
                "Latte": "#A8FF97",
                "LFE": "#004200",
                "LiveScript": "#499886",
                "Lua": "#fa1fa1",
                "Mask": "#f97732",
                "Matlab": "#bb92ac",
                "Max": "#ce279c",
                "Mercury": "#abcdef",
                "Mirah": "#c7a938",
                "MTML": "#0095d9",
                "Nemerle": "#0d3c6e",
                "nesC": "#ffce3b",
                "NetLogo": "#ff2b2b",
                "Nimrod": "#37775b",
                "Nu": "#c9df40",
                "Objective-C": "#438eff",
                "Objective-C++": "#4886FC",
                "Objective-J": "#ff0c5a",
                "OCaml": "#3be133",
                "Omgrofl": "#cabbff",
                "ooc": "#b0b77e",
                "Oxygene": "#5a63a3",
                "Pan": "#cc0000",
                "Parrot": "#f3ca0a",
                "Pascal": "#b0ce4e",
                "PAWN": "#dbb284",
                "Perl": "#0298c3",
                "Perl6": "#0298c3",
                "PHP": "#4F5D95",
                "Pike": "#066ab2",
                "PogoScript": "#d80074",
                "Processing": "#2779ab",
                "Prolog": "#74283c",
                "Propeller Spin": "#2b446d",
                "Puppet": "#cc5555",
                "Pure Data": "#91de79",
                "PureScript": "#bcdc53",
                "Python": "#3581ba",
                "QML": "#44a51c",
                "R": "#198ce7",
                "Racket": "#ae17ff",
                "Ragel in Ruby Host": "#ff9c2e",
                "Rebol": "#358a5b",
                "Red": "#ee0000",
                "Rouge": "#cc0088",
                "Ruby": "#701516",
                "Rust": "#dea584",
                "SAS": "#1E90FF",
                "Scala": "#7dd3b0",
                "Scheme": "#1e4aec",
                "Self": "#0579aa",
                "Shell": "#5861ce",
                "Shen": "#120F14",
                "Slash": "#007eff",
                "Smalltalk": "#596706",
                "SourcePawn": "#f69e1d",
                "Standard ML": "#dc566d",
                "SuperCollider": "#46390b",
                "Swift": "#ffac45",
                "SystemVerilog": "#343761",
                "Tcl": "#e4cc98",
                "TeX": "#3D6117",
                "Turing": "#45f715",
                "TypeScript": "#31859c",
                "Unified Parallel C": "#755223",
                "UnrealScript": "#a54c4d",
                "Vala": "#ee7d06",
                "VCL": "#0298c3",
                "Verilog": "#848bf3",
                "VHDL": "#543978",
                "VimL": "#199c4b",
                "Visual Basic": "#945db7",
                "Volt": "#0098db",
                "wisp": "#7582D1",
                "xBase": "#3a4040",
                "XQuery": "#2700e2",
                "Zephir": "#118f9e"
            };
        },
        convertHex: function (hex, opacity) {
            hex = hex.replace('#', '');
            var r = parseInt(hex.substring(0, 2), 16),
                g = parseInt(hex.substring(2, 4), 16),
                b = parseInt(hex.substring(4, 6), 16);
            return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
        }
    };



    return utils;

});