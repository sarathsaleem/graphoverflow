/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator , clearInterval , setInterval, d3*/

define(['d3', 'utils/utils'], function (ignore, _util) {

    "use strict";
    
    (function() {
      d3.force_labels = function force_labels() {    
        var labels = d3.layout.force();

        // Update the position of the anchor based on the center of bounding box
        function updateAnchor() {
          if (!labels.selection) return;
          labels.selection.each(function(d) {
            var bbox = this.getBBox(),
                x = bbox.x + bbox.width / 2,
                y = bbox.y + bbox.height / 2;

            d.anchorPos.x = x;
            d.anchorPos.y = y;

            // If a label position does not exist, set it to be the anchor position 
            if (d.labelPos.x == null) {
              d.labelPos.x = x;
              d.labelPos.y = y;
            }
          });
        }

        //The anchor position should be updated on each tick
        labels.on("tick.labels", updateAnchor);

        // This updates all nodes/links - retaining any previous labelPos on updated nodes
        labels.update = function(selection) {
          labels.selection = selection;
          var nodes = [], links = [];
          selection[0].forEach(function(d) {    
              console.log(d.__data__)
            if(d && d.__data__) {
              var data = d.__data__;

              if (!d.labelPos) d.labelPos = {fixed: false};
              if (!d.anchorPos) d.anchorPos = {fixed: true};

              // Place position objects in __data__ to make them available through 
              // d.labelPos/d.anchorPos for different elements
              data.labelPos = d.labelPos;
              data.anchorPos = d.anchorPos;

              links.push({target: d.anchorPos, source: d.labelPos});
              nodes.push(d.anchorPos);
              nodes.push(d.labelPos);
            }
          });
          labels
              .stop()
              .nodes(nodes)
              .links(links);
          updateAnchor();
          labels.start();
        };
        return labels;
      };
    })();
    //http://bl.ocks.org/ZJONSSON/1691430

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
            paddingTop = 260,
            margin = 30;

        var colors = d3.scale.category20b();



        var menu = $('<div class="categoryMenu"><div class="timeline ">Timeline</div><div class="cause active">Cause of death</div></div> <h1 class="title">27 CLUB</h1>');

        $(canvas).append(menu);

        $('.categoryMenu div').on('click', function () {
            $('.categoryMenu div').addClass('active');
            $(this).removeClass('active');

            if ($(this).hasClass('cause')) {
                $('.g8').css('background', '#0A76A2');
                cauase();
            } else {
                $('.g8').css('background', '#10a8c4');
                timelineMode();
            }
        });

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
        

        var cy = d3.scale.linear().domain([0, 365]).range(y.range()),
            cx = d3.time.scale().domain([artistdata[0].dod, artistdata[artistdata.length - 1].dod]).range(x.range());

        artistdata.forEach(function (d) {
            d.x =  cx(d.dod);
            d.y =  cy(d.days);
        });

        var stars = Chart.selectAll(".group")
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
        }).attr('class', 'label-name');


        stars.attr('class', 'group').attr("transform", function (d, i) {
            return "translate(-200, " + i * 15 + ")";
        });
        
        var mode = 'timeline';
        
        var tooltip = d3.select(canvas)
                .append("div").attr("class", "tooltip")
                .style("position", "absolute")
                .style("z-index", "10")
                .style("visibility", "hidden");


        stars.on("mouseover", function (d) {
            
                var text = '';
              
                if (mode === 'cause') {
                    text = d.cause;
                } else {
                    text = d.name +' <br/>'+ d.dod.getDate() +'/'+ d.dod.getMonth() +'/'+ d.dod.getFullYear();                    
                }
            
                return tooltip.style("visibility", "visible").html(text);
            })
            .on("mousemove", function () {
                var offset = $(canvas).offset();
                return tooltip.style("top", (event.pageY - offset.top + 30) + "px").style("left", (event.pageX - offset.left) + "px");
            })
            .on("mouseout", function () {
                return tooltip.style("visibility", "hidden");
            });
        
        
        
        
            var labels = Chart.selectAll(".labels").data(artistdata, function (d, i) {
                return i;
            });
            labels.exit().attr("class", "exit").transition().delay(0).duration(500).style("opacity", 0).remove();

            // Draw the labelbox, caption and the link
            var newLabels = labels.enter().append("g").attr("class", "labels")

            var newLabelBox = newLabels.append("g").attr("class", "labelbox");
            newLabelBox.append("circle").attr("r", 10)
            newLabelBox.append("text").attr("class", "labeltext").attr("y", 6);
            newLabels.append("line").attr("class", "link");

            var labelBox = Chart.selectAll(".labels").selectAll(".labelbox");
            var links = Chart.selectAll(".link");
            labelBox.selectAll("text").text(function (d) {
                return d.name;
            });
        
       function redrawLabels() {
            labelBox
                .attr("transform",function(d) { return "translate("+d.labelPos.x+","+d.labelPos.y+")";});

            links
                .attr("x1",function(d) { return d.anchorPos.x;})
                .attr("y1",function(d) { return d.anchorPos.y;})
                .attr("x2",function(d) { return d.labelPos.x;})
                .attr("y2",function(d) { return d.labelPos.y;});
       }    


         // Initialize the label-forces
        var labelForce = d3.force_labels()
            .linkDistance(0.0)
            .gravity(0)
            .nodes([]).links([])
            .charge(60)
            .on("tick", redrawLabels);
        
        labelForce.charge(60).start();   
        
        
        
        
        
        
        

        /**************** Timline **********************/

        function timelineMode() {
            
            mode = 'timeline';

            d3.selectAll('.axis').remove();
            d3.selectAll('.bg-cause').remove();

            Chart.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + (chartH + paddingTop) + ")")
                .call(xAxis);
            Chart.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + (paddingLeft - margin) + ", 0)")
                .call(yAxis);

            stars.transition().duration(1000).attr("transform", function (d) {                
                return "translate(" + d.x + ", " + d.y + ")";                
            });
            
            stars.call(labelForce.update);


        }

        /**************** Timline **********************/

        function cauase() {
            
            mode = 'cause';

            d3.selectAll('.axis').remove();
            d3.selectAll('.bg-cause').remove();           
           
            var topMargain = 200,
                top = 0,
                left = 50,
                lefts = [30, 250, 475, 695, 915, 1135], //corrected lefts
                pos = {},
                count = {};

            stars.transition().duration(1000).attr("transform", function (d) {
                if (d.type) {
                    left = ((d.type - 1) * 220) + 30;

                    pos[d.type] ? pos[d.type] += 50 : pos[d.type] = topMargain;

                    count[d.type] ? count[d.type] += 1 : count[d.type] = 1;

                    top = pos[d.type];
                }
                return "translate(" + lefts[d.type - 1 || 0] + ", " + top + ")";
            });

            var rects = d3.select(canvas).selectAll(".bg-cause")
                .data(data.types)
                .enter()
                .append('div').attr("class", "bg-cause")
                .html(function (d) {
                    var percentage = (count[d.index] / artistdata.length) * 100;
                    return d.name + '<br/><span>' + percentage.toFixed(2) + '%</span>';
                });

        }
        
        timelineMode();

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