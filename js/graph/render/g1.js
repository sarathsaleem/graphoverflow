/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator */

define(['d3', 'utils/utils'], function (d3, _util) {

    "use strict";



    function render(data, canvas) {

        var canvasWidth = 1333.33, //$(canvas).width(),
            canvasHeight = 1000; // $(canvas).height();

        var matrix = [];
        var tags = [];

        var tagsLength = data.tagList.length;

        var colors = d3.scale.category20();

        if (data.tagList) {
            data.tagList.forEach(function (tag) {
                tags.push(tag.name);
                var mapRow = data.map[tag.name];
                var mappedRelatedTagData = {};
                mapRow.forEach(function (tag) {
                    mappedRelatedTagData[tag.name] = tag.count;
                });
                var mappedRow = [];
                data.tagList.forEach(function (tag) {
                    mappedRow.push(mappedRelatedTagData[tag.name] || 0);
                });

                matrix.push(mappedRow);
            });
        }


        var g1Chart = d3.select(canvas).append("svg");

        var color,
            colorList = _util.getTagColors(),
            addedGradient = [];
        //add colors ids
        for (color in colorList) {
            if (colorList.hasOwnProperty(color)) {
                _util.addGradient(g1Chart.selectAll("svg")[0].parentNode, color, colorList[color].split(','));
                addedGradient.push(color);
            }
        }

        function getColor(nameOrindex) {
            var name = typeof nameOrindex === 'string' ? nameOrindex : tags[nameOrindex];
            return addedGradient.indexOf(name) > -1 ? "url(#grad-" + name + ")" : colors(tags.indexOf(name));
        }

        var fade = function (opacity, svg) {
            return function (g, i) {
                svg.selectAll("g.chord path")
                    .filter(function (d) {
                        return d.source.index !== i && d.target.index !== i;
                    })
                    .transition()
                    .style("opacity", opacity);
            };
        };


        /**************************************** Chord Diagram ********************************/

        g1Chart.attr("viewBox", "0 0 " + canvasWidth + " " + canvasHeight)
            .attr("preserveAspectRatio", "xMidYMid");

        function drawChordDiagram() {

            var chord = d3.layout.chord()
                .padding(0.025)
                .matrix(matrix);

            var w = Math.min(canvasWidth, canvasHeight),
                h = w,
                innerRadius = Math.min(w, h) * 0.36,
                outerRadius = innerRadius * 1.1;


            var chordChart = g1Chart.append("g")
                .attr("transform", "translate( " + (canvasWidth - canvasHeight) + ", 0)");

            var svg = chordChart.attr("width", w)
                .attr("height", h)
                .append("g")
                .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

            svg.append("g")
                .selectAll("path")
                .data(chord.groups)
                .enter().append("path")
                .style("fill", function (d) {
                    return getColor(d.index);
                })
                .style("fill-opacity", ".7")
                .style("stroke-width", ".5px")
                .style("stroke", "#000")
                .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
                .on("mouseover", fade(0.1, svg))
                .on("mouseout", fade(1, svg));

            var ticks = svg.append("g")
                .selectAll("g")
                .data(chord.groups)
                .enter().append("g");

            ticks.append("text")
                .each(function (d) {
                    d.angle = (d.startAngle + d.endAngle) / 2;
                })
                .attr("dy", ".35em")
                .attr("text-anchor", function (d) {
                    return d.angle > Math.PI ? "end" : null;
                })
                .attr("transform", function (d) {
                    return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" + "translate(" + (innerRadius + 45) + ")" + (d.angle > Math.PI ? "rotate(180)" : "");
                })
                .text(function (d) {
                    return tags[d.index];
                })
                .on("mouseover", fade(0.1, svg))
                .on("mouseout", fade(1, svg));

            svg.append("g")
                .attr("class", "chord")
                .selectAll("path")
                .data(chord.chords)
                .enter().append("path")
                .style("fill", function (d) {
                    return getColor(d.target.index);
                })
                .attr("d", d3.svg.chord().radius(innerRadius))
                .style("opacity", 1);
        }


        /**************************************** Bar chart ********************************/

        function drawHBarChart() {

            var width = canvasWidth - canvasHeight - 50,
                barHeight = (canvasHeight / tagsLength);


            var barScale = d3.scale.linear()
                .domain([0, data.tagList[0].count])
                .range([0, width - 50]);

            var chart = g1Chart.append('g')
                .attr('class', 'labelsWrap')
                .style("height", canvasHeight)
                .style("width", width);
            //.attr("transform", "translate(" + (canwasHeight + 10) + ", 10)");

            chart.append("rect")
                .attr("height", canvasHeight)
                .attr("width", width + 50)
                .attr('fill', "rgba(0, 0, 0, 0.4)");

            var bar = chart.selectAll("g")
                .data(data.tagList)
                .enter().append("g")
                .attr("transform", function (d, i) {
                    return "translate(0," + i * barHeight + ")";
                });

            bar.append("rect").attr("x", 0)
                .attr("width", function (d) {
                    return barScale(d.count);
                })
                .attr("height", barHeight - 3)
                .style("fill", function (d) {
                    return getColor(d.name);
                })
                .attr("x", "10")
                .style("stroke-width", ".5px")
                .style("stroke", "#000")
                .on("mouseover", fade(0.1, g1Chart))
                .on("mouseout", fade(1, g1Chart));
            //d3.select(this.parentNode).selectAll("text.text-count").style("opacity", 0);

            var barText = bar.append("text")
                .attr("x", function (d) {
                    return barScale(d.count) + 15;
                })
                .attr("y", barHeight / 2)
                .attr("dy", ".35em");

            barText.append("svg:tspan")
                .text(function (d) {
                    return d.name;
                }).style('font-size', '14px');

            barText.append("svg:tspan")
                .attr('class', "text-count")
                .text(function (d) {
                    return " - " + d.count;
                }).style('font-size', '12px');

        }

        drawChordDiagram();
        drawHBarChart();

        return g1Chart;
    }

    return render;

});
