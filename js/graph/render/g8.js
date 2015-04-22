/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator , clearInterval , setInterval, d3*/

define(['d3', 'utils/utils'], function (ignore, _util) {

    "use strict";


    function render(data, canvas) {

        var canvasWidth = 1333.33, //$(canvas).width(),
            canvasHeight = 1000; // $(canvas).height();


        var Chart = d3.select(canvas).append("svg");
        Chart.attr("viewBox", "0 0 " + canvasWidth + " " + canvasHeight)
            .attr("preserveAspectRatio", "xMidYMid");
          
        var artistdata = data.data;       
       
     

        artistdata.forEach(function (d) {

           d.dod = new Date(d.dod);
           /*var date = new Date(d.dod);
            
            var timeDiff = Math.abs((new Date(date.setYear(2000))).getTime() - (new Date("1/1/2000")).getTime());
            
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            d.days = diffDays;                       
             
            if (d.cause.match(/Drug|Poison/ig)) {
                d.type = 1;
            }
            
            if (d.cause.match(/Suicide/ig)) {
                d.type = 2;
            }
            
            if (d.cause.match(/Traffic|accident/ig)) {
                d.type = 3;
            }
            
            if (d.cause.match(/Murdered/ig)) {
                d.type = 4;
            }
            
            if (d.cause.match(/Complications|Heart/ig)) {
                d.type = 5;
            }*/
        });
        
        /*

        function sortByDateAscending(a, b) {
            return a.dod - b.dod;
        }
        data = data.sort(sortByDateAscending);
        */
       
        var chartW = canvasWidth - 100,
            chartH = 700,
            paddingLeft = 70,
            paddingTop = 250,
            margin = 20;

        var colors = d3.scale.category20();

        
        
        var menu = $('<div class="categoryMenu"><div class="timeline ">Timeline</div><div class="cause active">Cause of death</div></div> <h1 class="title">27 CLUB</h1>');
        
        $(canvas).append(menu);
        
        $('.categoryMenu div').on('click', function () {
           $('.categoryMenu div').addClass('active');
           $(this).removeClass('active');
            
            if( $(this).hasClass('cause')) {
                $('.g8').css('background','#0A76A2');
                cauase();
            } else {
                 $('.g8').css('background','#10a8c4');
                 timelineMode();
            }
        });

       var stars = Chart.selectAll(".line")
            .data(artistdata)
            .enter()
            .append('g');
        
         var artists = stars.append('circle')
            .attr("r", 20)
            .style("fill", function (d, i) {
                return colors(i);
            });


        stars.append('text').text(function (d) {
            return d.name;
        }).attr('x', function () {
            return 30;
        })
        .attr('class', 'label-name');
        
        
        stars.attr('class', 'group').attr("transform", function (d, i) {
            return "translate(-200, " + i * 15 + ")";
        });


        /**************** Timline **********************/
        
        function timelineMode() {
            
            d3.selectAll('.axis').remove();
            
            var x = d3.time.scale()
                .range([paddingLeft, chartW]);

            var y = d3.scale.linear()
                .range([chartH + paddingTop - margin, paddingTop]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

            x.domain(d3.extent(artistdata, function (d) {
                return d.dod;
            }));
            y.domain(d3.extent(artistdata, function (d) {
                return d.dod.getMonth() + 1;
            }));


            Chart.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + (chartH + paddingTop) + ")")
                .call(xAxis);
            Chart.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + (paddingLeft - margin) + ", 0)")
                .call(yAxis);
            
            var cy = d3.scale.linear().domain([0, 365]).range(y.range()),
                cx = d3.time.scale().domain([artistdata[0].dod, artistdata[artistdata.length - 1].dod]).range(x.range());

            stars.transition().duration(1000).attr("transform", function (d) {
                return "translate(" + cx(d.dod) + ", " + cy(d.days) + ")";
            });
        }
        
        
        /**************** Timline **********************/
       
        function cauase() {
          
            d3.selectAll('.axis').remove();
            
            var top = 250;
            var left = 50;

            var pos = {};
            stars.transition().duration(1000).attr("transform", function (d) {

                if (d.type) {
                     left = (d.type-1) * 250 + 50;
                     if (pos[d.type]) { 
                        pos[d.type] += 50;
                     } else {
                        pos[d.type] = 300;
                     }                  
                     top = pos[d.type];
                }

                return "translate(" + left + ", " + top + ")";
            });
            
            var rects =  Chart.selectAll(".rects")
            .data(data.types)
            .enter()
            .append('rect')
            .attr("width", 100)
            .attr("height", 100)
            .attr("transform", function (d, i) {
                return "translate(" + i*100 + ", 500)";
            })
            .style("fill", function (d, i) {
                return colors(i);
            });
            
            

        }

        /*
        
        var line = d3.svg.line().interpolate('basis');

        
        
        var drawPath = function (data, i) {
                
             var ele = d3.select(artists[0][i]),
                ele2 = d3.select(artists[0][i+1] || artists[0][0]);
       
            var x1 =  cx(data.dod),
                y1 =  cy(data.days),
                x2 =  cx(ele2.data()[0].dod),
                y2 = cy(ele2.data()[0].days);
            
                var d = Math.abs(x1-x2)/2;
                
                var points = [
                        [x1, y1], [x2, y2]
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
                .attr('d', drawPath )
                .on('mouseover', function () {
                    d3.select(this).attr('class', 'link on');
                })
                .on('mouseout', function () {
                    d3.select(this).attr('class', 'link');
                })
                .transition()
                .duration(100)
                .attr('d',  drawPath);
        */



    }
    return render;

});