/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator */

define(['d3', 'utils/utils'], function (ignore, _util) {

    "use strict";

    function rnd(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    function processData(data) {
        var reverseMap = function (data) {
            var revMap = {};
            Object.keys(data.map).forEach(function (value) {
                revMap[data.map[value]] = value;
            });
            data.refMap = revMap;
        };
        reverseMap(data);
        var map = data.refMap,
            language = {},
            eventTypes = {};
        for (var i = 0, len = data.events.length; i < len; i++) {
            var event = data.events[i].split(','),
                lan = map[event[0]],
                eventType = map[event[1]];
            if (language[lan]) {
                language[lan]++;
            } else {
                language[lan] = 1;
            }
            if (eventTypes[eventType]) {
                eventTypes[eventType]++;
            } else {
                eventTypes[eventType] = 1;
            }
        }

        data.language = language;
        data.eventTypes = eventTypes;
        return data;
    }


    function render(data, container) {


        var canvasWidth = 1333.33, //$(canvas).width(),
            canvasHeight = 1000; // $(canvas).height();

        var canvas = d3.select(container).append("canvas")[0][0];
        var ctx = canvas.getContext('2d');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        function drawDot(x, y, color) {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);

        }

        var langugeColors = _util.gitColors();
        var colors = d3.scale.category20();

        var gitData = processData(data);


        var lanColor = {};
        Object.keys(gitData.language).forEach(function (lan, i) {
            var color = langugeColors[lan] ? langugeColors[lan].split(',')[0] : colors(i);
            lanColor[lan] = color;
        });
        gitData.lanColor = lanColor;
        console.log(gitData);

        for (var i = 0, len = gitData.events.length; i < len; i++) {
            var event = gitData.events[i].split(','),
                lan = gitData.refMap[event[0]],
                color = gitData.lanColor[lan];

            var x = rnd(-1333, 1333),
                y = rnd(-1000, 1000);

            drawDot(x, y, color);
        }



        processData(data);
    }

    return render;

});