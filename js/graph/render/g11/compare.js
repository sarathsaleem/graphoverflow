define(['libs/d3v5', 'utils/utils'], function (d3, _util) {

    "use strict";

    return function () {
        var weekData = [
            // { "st": "KERALA", "a": 349.7, "n": 98.4, "p": 255 },
            { "st": "Alapuzha", "a": 220.9, "n": 74.9, "p": 195 },
            { "st": "Eranakulam", "a": 220.5, "n": 98.6, "p": 124 },
            { "st": "Idukki", "a": 679.0, "n": 126.3, "p": 438 },
            { "st": "Kannur", "a": 324.3, "n": 132.7, "p": 144 },
            { "st": "Kasaragod", "a": 298.6, "n": 156.1, "p": 91 },
            { "st": "Kollam", "a": 282.1, "n": 48.7, "p": 479 },
            { "st": "Kottyam", "a": 205.2, "n": 87.2, "p": 135 },
            { "st": "Kozhikode", "a": 375.4, "n": 122.9, "p": 205 },
            { "st": "Malapuram", "a": 452.7, "n": 89.7, "p": 405 },
            { "st": "Palakkad", "a": 350.7, "n": 83.1, "p": 322 },
            { "st": "Pathanamthitta", "a": 254.9, "n": 80.4, "p": 217 },
            { "st": "Thiruvananthapuram", "a": 210.1, "n": 29.3, "p": 617 },
            { "st": "Thrissur", "a": 180.3, "n": 102.6, "p": 76 },
            { "st": "Wayanad", "a": 536.8, "n": 134.4, "p": 299 }
        ]
        var dists = [];

        var width = 500;
        var height = 300;
        var marginLeft = 20;
        var marginRight = 20;
        var marginTop = 0;

        var weekDataBarChart = $('#weekDataBarChart');

        var svg = d3.select(weekDataBarChart[0]).append("svg")
            .attr("viewBox", "0 0 " + width + " " + (height + 50))
            .attr("preserveAspectRatio", "xMidYMid");
        // .attr('width', width)
        // .attr('height', height + 50);

        var tY = d3.scaleBand()
            .rangeRound([0, height])
        tY.domain(weekData.map(function (d) { return d.st; }));

        var tX = d3.scaleLinear()
            .rangeRound([0, width - marginRight - 100])
            .domain([0, 700]);

        var xAxis = d3.axisBottom()
            .scale(tX);

        var yAxis = d3.axisLeft()
            .scale(tY);

        var chartWrap = svg.append('g').attr("class", "chartWrap").attr("transform", "translate(0,0)");
        var barHeight = 18;
        //     stop - color: #7db9e8;
        // }
        //     .stop - middle {
        //     stop - color: #2B94E5;
        // }
        // .stop - right {
        //     stop - color: #1E5799;
        var color = d3.scaleLinear()
            .domain([0, 300, 700])
            .range(["#7db9e8", '#2B94E5', "#1E5799"]);

        var color1 = d3.scaleLinear()
            .domain([0, 500])
            .range(["#2B94E5", '#1E5799']);
        chartWrap.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(100,0)")
            .call(yAxis);

        chartWrap.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(100," + (height - marginTop) + ")")
            .call(xAxis);

        weekData.forEach(function (d) {
            _util.addGradient(svg._groups[0][0], d.st, [color(0), color(d.a)]);
            _util.addGradient(svg._groups[0][0], 'no' + d.st, [color1(0), color1(d.a)]);
        });

        chartWrap
            .selectAll('.actualRect')
            .data(weekData)
            .enter()
            .append('rect')
            .attr('x', 100)
            .attr('y', function (d, i) {
                return tY(d.st);
            })
            .attr('width', function (d) {
                return tX(d.a);
            })
            .attr('height', barHeight)
            .attr('fill', function (d) {
                return 'url(#grad-' + d.st + ')';
            });
        chartWrap
            .selectAll('.actualRect')
            .data(weekData)
            .enter()
            .append('rect')
            .attr('x', 100)
            .attr('y', function (d, i) {
                return tY(d.st);
            })
            .attr('width', function (d) {
                return tX(d.n);
            })
            .attr('height', barHeight)
            .attr('fill', function (d) {
                return 'url(#grad-no' + d.st + ')';
            });

        chartWrap.append('text')
            .attr('class', 'textLabel')
            .text('rainfall (mm)')
            .attr('x', 250)
            .attr('y', height + 27)
            .attr("fill", '#7a7a7a');

        chartWrap.append('text')
            .attr('class', 'textLabel')
            .text('Kerala avg actutal rainfall is 349.7(mm)')
            .attr('x', 105 + tX(349.7))
            .attr('y', 10)
            .attr("fill", '#7a7a7a');

        chartWrap.append('text')
            .attr('class', 'weekInfoText')
            .text('Actual v/s Normal rainfall data on week 09-08-2018 To 15-08-2018 ')
            .attr('x', 50)
            .attr('y', height + 50);

        chartWrap.append('line')
            .attr("x1", tX(349.7))
            .attr("y1", 0)
            .attr("x2", tX(349.7))
            .attr("y2", height)
            .attr("stroke-width", 2)
            .attr("stroke", "#1E5799")
            .attr("transform", "translate(100,0)");

    };

});
