/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator , clearInterval , setInterval*/
define(['d3', 'utils/utils'], function (ignore, _util) {

    "use strict";

    function render(data, canvas) {

        var canvasWidth = 1333.33, //$(canvas).width(),
            canvasHeight = 1000, // $(canvas).height();
            paddingleft = 100, //for label
            paddingBottom = 70,
            allCounts = [];


        function sortByTime(a, b) {
            return +a.time - +b.time;
        }

        /**
            Tue Dec 24 2013 04:00:00  5579 -- is the count of 23-24
            Wed Dec 25 2013 04:00:00  4634 -- is the count of 24-25

            So shift the days by one to left , ie start from Saturday.
        */

        var days = ['Sunday', 'Monday', 'Tuesday', 'Wenesday', 'Thursday', 'Friday', 'Saturday'];

        var formatedData = [];

        data.sort(sortByTime);
        //delete firstdata-- data error
        data.splice(0, 1);

        data.forEach(function (oneday) {
            var timeObj = new Date(+oneday.time),
                day = +timeObj.getUTCDay(),
                date = timeObj.getUTCDate(),
                month = timeObj.getUTCMonth();

            //shift day
            day = day - 1;
            day = day < 0 ? 6 : day;

            allCounts.push(oneday.count);

            if (formatedData[day]) {
                formatedData[day].data.push({
                    stamp: oneday.time,
                    date: date,
                    month: month,
                    count: oneday.count
                });
            } else {
                formatedData[day] = {
                    day: days[day],
                    data: []
                };
            }

        });


        var gridWidth = canvasWidth - paddingleft,
            gridHeight = canvasHeight - paddingBottom,
            spacingDays = gridWidth / formatedData[0].data.length,
            spacingWeek = gridHeight / days.length;

        var Chart = d3.select(canvas).append("svg");
        Chart.attr("viewBox", "0 0 " + canvasWidth + " " + canvasHeight)
            .attr("preserveAspectRatio", "xMidYMid");

        //Bg
        Chart.append('rect')
            .attr("width", canvasWidth)
            .attr("height", canvasHeight).style('fill', '#FFF');


        var maxCount = d3.max(allCounts),
            minCount = d3.min(allCounts);

        var getColor = d3.scale.linear().domain([0, maxCount]).range(["#e5f5e0", "#0F772E"]),
            getRadius = d3.scale.linear().domain([minCount, maxCount]).range([minCount / 200, maxCount / 200]);


        var weeks = Chart.selectAll('g')
            .data(formatedData)
            .enter()
            .append('g')
            .attr('class', 'week')
            .attr("transform", function (d, i) {
                return "translate(200," + (spacingWeek * (i + 1)) + ")";
            });

        var days = weeks.selectAll('circle')
            .data(function (d) {
                return d.data;
            })
            .enter()
            .append('circle')
            .attr('class', 'day');

        days.transition().delay(function (d, i) {
            return i * 20;
        }).duration(200).ease("easeIn")
            .attr("r", function (d) {
                return getRadius(d.count);
            })
            .attr("transform", function (d, i) {
                return "translate(" + i * spacingDays + ",0)";
            })
            .style("fill", function (d) {
                return getColor(d.count);
            });

        days.on('mouseover', function (d, e) {
            var pos = d3.mouse(Chart.node());
            label.attr("transform", function () {
                return "translate(" + (pos[0] + 10) + ", " + (pos[1] - 30) + ")";
            });
            label.style('display', 'block');
            text.html(d.count);
        }).on('mouseout', function (e) {
            label.style('display', 'none');
        });


        weeks.append('text')
            .text(function (d) {
                return d.day.toUpperCase();
            })
            .attr("transform", function () {
                return "translate(-180, 10)";
            })
            .style({
                'fill': '#0C6124',
                'font-size': '20px',
                'font-weight': 'bold'
            });

        var label = Chart.append('g').style('display', 'none');
        label.append('rect')
            .attr('width', 60)
            .attr('height', 40).attr('rx', 10).attr('ry', 10);

        var text = label.append('text').attr("transform", function () {
            return "translate(10, 25)";
        });

    }

    return render;

});
