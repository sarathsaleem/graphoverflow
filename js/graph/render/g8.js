/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator , clearInterval , setInterval, d3*/

define(['d3', 'utils/utils'], function (ignore, _util) {

    "use strict";

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
        });


        var chartW = canvasWidth - 100,
            chartH = 700,
            paddingLeft = 70,
            paddingTop = 260,
            margin = 30;

        var colors = d3.scale.category10();

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

        x.domain(d3.extent(artistdata, function (d) {
            return d.dod;
        }));
        y.domain(d3.extent(artistdata, function (d) {
            return d.dod.getMonth();
        }));

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left").tickFormat(function (d, i) {
                return month_names_short[d];
            });;


        var cy = d3.scale.linear().domain([0, 365]).range(y.range()),
            cx = d3.time.scale().domain([artistdata[0].dod, artistdata[artistdata.length - 1].dod]).range(x.range());

        artistdata.forEach(function (d) {
            d.x = cx(d.dod);
            d.y = cy(d.days);
        });

        var stars = Chart.selectAll(".group")
            .data(artistdata)
            .enter()
            .append('g');

        var artists = stars.append('circle')
            .attr("r", 20)
            .style("fill", function (d, i) {
                colors(d.type);
                return colors(d.type + 1);
            });


        stars.append('text').text(function (d) {
            return d.name;
        }).attr('x', function () {
            return 30;
        }).attr('class', 'label-name');

        stars.attr('class', 'group').attr("transform", function (d, i) {
            return "translate(-200, " + i * 15 + ")";
        }).attr('pos', function (d, i) {
            return i;
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
                text = d.name + ' <br/>' + d.dod.getDate() + '/' + d.dod.getMonth() + '/' + d.dod.getFullYear();
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
            arrangeLabels();
        }

        function arrangeLabels() {
            var pos = {
                '4': [-65, -25],
                '7': [-115, 5],
                '23': [25, -15],
                '17': [20, -15],
                '16': [-150, 5],
                '14': [-110, 10],
                '19': [20, 20],
                '6': [30, -10],
                '11': [-145, 20],
                '41': [30, 5],
                '13': [20, -10],
                '28': [-130, 10],
                '31': [-30, 40],
                '35': [-5, 35],
                '30': [20, -20],
                '32': [-130, 15],
                '38': [-180, 10],
                '46': [-50, -25],
                '45': [-50, 30]
            };
            var keys = Object.keys(pos);
            Chart.selectAll(".label-name")
                .each(function (d, i) {
                    if (keys.indexOf("" + i) > -1) {
                        $(this).attr('x', pos[i][0]).attr('y', pos[i][1]);
                    }

                });
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

            Chart.selectAll(".label-name").attr('x', 30).attr('y', 0);

        }

        timelineMode();



    }
    return render;

});
