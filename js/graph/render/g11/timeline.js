define(['libs/d3v5', 'utils/utils'], function (d3, _util) {

    "use strict";


    function rnd(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    return function (canvas) {

        var timeLinedata = [
            { time: '08/08/2018', text: 'Kerala received rainfall of 310mm over 24 hours' },
            { time: '08/09/2018', text: 'Idukki dam’s first gate opened. Reservoir’s gate has not opened in 26 years.' },
            { time: '08/11/2018', text: 'Idukki dam level reached 2400.18 ft. Max is 2,404 ft.' },
            { time: '08/15/2018', text: 'Kochi international airport shut since August 15 due to heavy flooding.' },
            { time: '08/16/2018', text: '35 dams in the state opened. 255% more rainfall between August 9 and August 15.' },
            { time: '08/18/2018', text: 'Water levels at Idukki 2402.Death tolls 195' },
            { time: '08/20/2018', text: '1M people in relief camps.' },
            { time: '08/25/2018', text: 'Apple donates Rs 7 crore for Kerala flood victims' },
            { time: '08/30/2018', text: "483 dead in Kerala floods and landslides" },
        ];

        var timelineWrapper = $('#timelineGraph');
        //$(canvas).append(timelineWrapper);

        var width = 1200;
        var height = 520;
        var marginLeft = 20;
        var marginRight = 50;
        var marginTop = 0;


        var x = d3.scaleTime()
            .domain([new Date('08/08/2018'), new Date('08/30/2018')])
            .range([marginLeft, width - marginRight]);

        var svg = d3.select(timelineWrapper[0]).append("svg")
            .attr("viewBox", "0 0 " + width + " " + height)
            .attr("preserveAspectRatio", "xMidYMid");
        // .attr('width', width)
        // .attr('height', height + 30);

        var grid = svg.append('g').attr("class", "gridWrapper").attr("transform", "translate(0,10)");

        var currentMonth = 0;
        var topLineMargin = 200;
        // grid.append("line")
        //     .attr("x1", Math.round(x(new Date(timeLinedata[0].time))))
        //     .attr("y1", topLineMargin)
        //     .attr("x2", Math.round(x(new Date(timeLinedata[timeLinedata.length - 1].time))))
        //     .attr("y2", topLineMargin)
        //     .attr("class", 'timlineDotConnector');

        var marginMap = [5, 55, 160, 105];
        grid.selectAll('.timePointLine')
            .data(timeLinedata)
            .enter()
            .append('line')
            .attr("x1", function (d, i) {
                return Math.round(x(new Date(d.time)));
            })
            .attr("y1", function (d, i) {
                return marginTop + marginMap[i % 4];
            })
            .attr("x2", function (d, i) {
                return Math.round(x(new Date(d.time)));
            })
            .attr("y2", marginTop + height - 27)
            .attr("class", 'timlineDotConnector');

        // var circles = grid.selectAll('.timelinePoints')
        //     .data(timeLinedata)
        //     .enter()
        //     .append('circle')
        //     .attr("r", 5)
        //     .attr("class", 'timelinePoints')
        //     .attr("transform", "translate(0," + topLineMargin + ")")
        //     //.transition().duration(1000)
        //     .attr("transform", function (d, i) {
        //         var left = x(new Date(d.time));
        //         return "translate(" + left + "," + topLineMargin + ")";
        //     });

        var labelFormat = d3.timeFormat("%b %d");

        var dateLabels = grid.selectAll('.dateLabels')
            .data(timeLinedata)
            .enter()
            .append('text')
            .text(function (d) {
                return labelFormat(new Date(d.time));
            })
            .attr("class", 'dateLabels')
            .attr("transform", function (d, i) {
                var left = x(new Date(d.time));
                return "translate(" + left + "," + (marginTop + height - 15) + ")";
            });


        timeLinedata.forEach((event, i) => {
            var tX = x(new Date(event.time)) - 10;
            var tY = marginTop + marginMap[i % 4];
            var isLast = '';
            if (i === timeLinedata.length - 1) {
                isLast = 'eventLast';
                tX = tX - 214;
            }
            tX = tX / width * 100;
            tY = tY / height * 100;

            timelineWrapper.append('<div style="left: ' + tX + '%;top: ' + tY + '%" class="eventInfo ' + isLast + '">' + event.text + '</div>')
        });

        var cumilativeData = [
            { "time": "08/08/2018", "actual": 1750, "normal": 1500 },
            { "time": "09/08/2018", "actual": 1800, "normal": 1510 },
            { "time": "10/08/2018", "actual": 1830, "normal": 1515 },
            { "time": "11/08/2018", "actual": 1880, "normal": 1550 },
            { "time": "12/08/2018", "actual": 1890, "normal": 1580 },
            { "time": "13/08/2018", "actual": 1910, "normal": 1590 },
            { "time": "14/08/2018", "actual": 1980, "normal": 1595 },
            { "time": "15/08/2018", "actual": 2090, "normal": 1600 },
            { "time": "16/08/2018", "actual": 2210, "normal": 1610 },
            { "time": "17/08/2018", "actual": 2300, "normal": 1620 },
            { "time": "18/08/2018", "actual": 2330, "normal": 1630 },
            { "time": "19/08/2018", "actual": 2380, "normal": 1670 },
            { "time": "20/08/2018", "actual": 2390, "normal": 1680 },
            { "time": "21/08/2018", "actual": 2395, "normal": 1690 },
            { "time": "22/08/2018", "actual": 2398, "normal": 1700 },
            { "time": "23/08/2018", "actual": 2399, "normal": 1702 },
            { "time": "24/08/2018", "actual": 2400, "normal": 1705 },
            { "time": "25/08/2018", "actual": 2405, "normal": 1710 },
            { "time": "26/08/2018", "actual": 2408, "normal": 1720 },
            { "time": "27/08/2018", "actual": 2415, "normal": 1750 },
            { "time": "28/08/2018", "actual": 2420, "normal": 1780 },
            { "time": "29/08/2018", "actual": 2425, "normal": 1790 },
            { "time": "30/08/2018", "actual": 2428, "normal": 1795 }
        ];


        var parseDate = d3.timeParse("%d/%m/%Y");
        cumilativeData.forEach(function (d) {
            d.time = parseDate(d.time);
        });

        var tX = d3.scaleTime()
            .range([marginLeft, width - marginRight]);
        tX.domain(d3.extent(cumilativeData, function (d) { return d.time }))

        var tY = d3.scaleLinear()
            .range([300, 0])
            .domain([1400, 2500]);

        var xAxis = d3.axisBottom()
            .scale(tX);

        var yAxis = d3.axisRight()
            .scale(tY);

        var actualArea = d3.area()
            .x(function (d) { return tX(d.time); })
            .y1(function (d) { return tY(d.actual); })
            .y0(marginTop + 300)
        // .curve(d3.curveCardinal);

        var normalArea = d3.area()
            .x(function (d) { return tX(d.time); })
            .y1(function (d) { return tY(d.normal); })
            .y0(marginTop + 300)
        // .curve(d3.curveCardinal);

        var areaWrap = svg.append('g').attr("class", "areaWrap").attr("transform", "translate(0," + (marginTop + 200) + ")");

        // areaWrap.append("g")
        //     .attr("class", "x axis")
        //     .attr("transform", "translate(0," + 0 + ")")
        //     .call(xAxis);

        var svgDefs = svg.append('defs');
        var actualAreaGradient = svgDefs.append('linearGradient')
            .attr('id', 'actualAreaGradient');
        actualAreaGradient.append('stop')
            .attr('class', 'stop-left')
            .attr('offset', '0');
        actualAreaGradient.append('stop')
            .attr('class', 'stop-middle')
            .attr('offset', '0.3');
        actualAreaGradient.append('stop')
            .attr('class', 'stop-right')
            .attr('offset', '1');
        var normalAreaGradient = svgDefs.append('linearGradient')
            .attr('id', 'normalAreaGradient');
        normalAreaGradient.append('stop')
            .attr('class', 'stop-left')
            .attr('offset', '0');
        normalAreaGradient.append('stop')
            .attr('class', 'stop-middle')
            .attr('offset', '0.3');
        normalAreaGradient.append('stop')
            .attr('class', 'stop-right')
            .attr('offset', '1');

        areaWrap.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (width - marginRight + 5) + ",0)")
            .call(yAxis);

        areaWrap.append("clipPath")
            .attr("id", "rectClip")
            .append("rect")
            .attr("width", 0)
            .attr("height", 300);

        areaWrap.append("path")
            .data([cumilativeData])
            .attr("class", "actualArea")
            .attr("d", actualArea)
            .attr("clip-path", "url(#rectClip)");


        areaWrap.append("path")
            .data([cumilativeData])
            .attr("class", "normalArea")
            .attr("d", normalArea)
            .attr("clip-path", "url(#rectClip)");

        d3.select("#rectClip rect")
            .transition().duration(3000)
            .attr("width", width - marginRight);

        areaWrap.append('text')
            .text("cumilative rainfall (mm)")
            .attr("class", 'dateLabels')
            .attr("transform", function (d, i) {
                return "translate(" + (width - 7) + "," + (150) + ") rotate(90)";
            });
        // function rectPath(x, y, width, height, radius) {
        //     return "M" + x + "," + y
        //         + "h" + (width - radius)
        //         + "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius
        //         + "v" + (height - 2 * radius)
        //         + "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + radius
        //         + "h" + (radius - width)
        //         + "z";
        // }

        // var rectD = rectPath(10, 400, 100, 300, 0);

        // function pathTween(d1, precision) {
        //     return function () {
        //         var path0 = this,
        //             path1 = path0.cloneNode(),
        //             n0 = path0.getTotalLength(),
        //             n1 = (path1.setAttribute("d", d1), path1).getTotalLength();
        //         // Uniform sampling of distance based on specified precision.
        //         var distances = [0], i = 0, dt = precision / Math.max(n0, n1);
        //         while ((i += dt) < 1) distances.push(i);
        //         distances.push(1);
        //         // Compute point-interpolators at each distance.
        //         var points = distances.map(function (t) {
        //             var p0 = path0.getPointAtLength(t * n0),
        //                 p1 = path1.getPointAtLength(t * n1);
        //             return d3.interpolate([p0.x, p0.y], [p1.x, p1.y]);
        //         });
        //         return function (t) {
        //             return "M" + points.map(function (p) { return p(t); }).join("L");
        //         };
        //     };
        // }
        // areaCopy
        //     .transition()
        //     .duration(3000)
        //     .on("start", function repeat() {
        //         d3.active(this)
        //             .attrTween("d", pathTween(rectD, 4))
        //             .transition();
        //     });
    }
});
