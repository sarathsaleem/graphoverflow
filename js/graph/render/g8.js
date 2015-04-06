/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator , clearInterval , setInterval*/

define(['d3', 'utils/utils'], function (ignore, _util) {

    "use strict";


    function render(data, canvas) {

        var canvasWidth = 1333.33, //$(canvas).width(),
            canvasHeight = 1000, // $(canvas).height();
            paddingleft = 100, //for label
            paddingBottom = 70;


        var Chart = d3.select(canvas).append("svg");
        Chart.attr("viewBox", "0 0 " + canvasWidth + " " + canvasHeight)
            .attr("preserveAspectRatio", "xMidYMid");


        var parseDate = d3.time.format("%B-%d-%Y").parse;


        data.forEach(function (d) {
            var date = d.dod.replace(',', '').replace(/ /gi, '-');
            d.dod = parseDate(date);
            var timeDiff = Math.abs((new Date(parseDate(date).setYear(2000))).getTime() - (new Date("1/1/2000")).getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            d.days = diffDays;
        });

        console.log(data)


        var chartW = canvasWidth - paddingleft,
            chartH = canvasHeight - paddingBottom;
        var x = d3.time.scale()
            .range([0, chartW]);

        var y = d3.scale.linear()
            .range([chartH, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");



        x.domain(d3.extent(data, function (d) {
            return d.dod;
        }));
        y.domain(d3.extent(data, function (d) {
            return d.dod.getMonth() + 1;
        }));


        Chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + chartH + ")")
            .call(xAxis);
        Chart.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + 40 + ",0)")
            .call(yAxis);

        var cy = d3.scale.linear().domain([0, 365]).range([chartH-40, 0]),
            cx = d3.time.scale().domain([new Date('01/01/1900'), new Date('01/01/2015')]).range([0, chartW]);

     var colors = d3.scale.category20();


        var stars = Chart.selectAll(".line")
            .data(data)
            .enter()
            .append('g')
            .attr('x',  function (d) {
                return cx(d.dod);
            })
            .attr('y',  function (d) {
               return cy(d.days);
            })
            .attr('width', 40)
            .attr('height', 40)
            .style("fill", function(d, i) { return colors(i); });
        /*
       var line = d3.svg.line().interpolate('basis');

        var drawPath = function (start) {
                return function (l) {
                    var points = [
                        [100, 100], [450, 100], [450, 800], [800, 800]
                    ];
                    return line(points);
                };
            };

        var links = Chart.selectAll('path.link')
                .data([1])
                .enter().append('svg:path')
                .attr('class', 'link')
                .style('stroke-width', function (l) {
                    return 50;
                })
                .attr('d', drawPath())
                .on('mouseover', function () {
                    d3.select(this).attr('class', 'link on')
                })
                .on('mouseout', function () {
                    d3.select(this).attr('class', 'link')
                })
                .transition()
                .duration(100)
                .attr('d', drawPath());

    */

    }
    return render;

});
