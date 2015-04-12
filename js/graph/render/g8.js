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
        
        function sortByDateAscending(a, b) {
            return a.dod - b.dod;
        }
        data = data.sort(sortByDateAscending);
        
        console.log(data);

        var chartW = canvasWidth - 100,
            chartH = 700,
            padding = 50;
        
        var x = d3.time.scale()
            .range([padding, chartW]);
        
        var y = d3.scale.linear()
            .range([chartH, padding]);

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
            .attr("transform", "translate(0," + (chartH+10) + ")")
            .call(xAxis);
        Chart.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate("+(padding- 20)+", 0)")
            .call(yAxis);

        var cy = d3.scale.linear().domain([0, 365]).range(y.range()),
            cx = d3.time.scale().domain([data[0].dod, data[data.length-1].dod]).range(x.range());

     var colors = d3.scale.category20();


        var stars = Chart.selectAll(".line")
            .data(data)
            .enter()
            .append('g').attr('class', 'group');
        
        var artists = stars.append('circle').attr('cx', 0)
            .attr('cy',  function (d) {
               return cy(d.days);
            })
            .attr("r", 20)
            .style("fill", function(d, i) { return colors(i); })
            .transition()
            .duration(1000)
            .attr('cx',  function (d) {
                return cx(d.dod);
            });
        
        
        stars.append('text').text(function (d) {
            return d.name;
        }).attr('x',  function (d) {
                return cx(d.dod);
            })
            .attr('y',  function (d) {
               return cy(d.days) - 30;
            }).attr('class', 'label-name');
       
       var line = d3.svg.line().interpolate('basis');

        
        
        var drawPath = function (data, i) {
                
             var ele = d3.select(artists[0][i]),
                ele2 = d3.select(artists[0][i+1] || artists[0][0]);
            console.log(ele2.data())
       
            var x1 =  cx(data.dod),
                y1 =  cy(data.days),
                x2 =  cx(ele2.data()[0].dod),
                y2 = cy(ele2.data()[0].days);
            
                var d = Math.abs(x1-x2)/2;
                
                var points = [
                        [x1, y1], [d, y1], [d, x2], [x2, y2]
                ];
                return line(points);
                
            };

        
        var links = Chart.selectAll('path.link')
                .data(data)
                .enter().append('svg:path')
                .attr('class', 'link')
                .style('stroke-width', function (l) {
                    return 20;
                })
                .attr('d',   drawPath )
                .on('mouseover', function () {
                    d3.select(this).attr('class', 'link on')
                })
                .on('mouseout', function () {
                    d3.select(this).attr('class', 'link')
                })
                .transition()
                .duration(100)
                .attr('d',  drawPath);
      
   

    }
    return render;

});
