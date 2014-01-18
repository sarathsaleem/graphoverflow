/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator */

define(['d3', 'utils/utils'], function (d3, _util) {

    "use strict";

    function render(data, canvas) {

        var canvasWidth = 1333.33, //$(canvas).width(),
            canvasHeight = 1000, // $(canvas).height();
            paddingleft = 150, //for label
            paddingBottom = 70,
            plotMap = [],
            horizontals = [],
            allCounts = [],
            tagLengthShown = 40;

        var date = "8/2009";


        function sortYearData(a, b) {
            return a.split('/')[1] - b.split('/')[1];
        }

        /* function getGrowth(a, b, i) {
            if (i === 1) {
                growthRate[a] = oneRowData[a];
            }
            console.log(a, b, oneRowData[a], oneRowData[b]);

            growthRate[b] = oneRowData[b] - oneRowData[a];

            return b;
        }*/

        Object.keys(data.map).forEach(function (tagName) {

            var oneRowData = {};

            data.map[tagName].forEach(function (row) {
                var time = new Date(row.time);
                oneRowData[(+(time.getMonth()) + 1) + "/" + time.getFullYear()] = row.count;
                allCounts.push(row.count);
            });

            //Object.keys(oneRowData).sort(sortYearData).reduce(getGrowth);

            horizontals.push(tagName);
            plotMap.push({
                name: tagName,
                countData: oneRowData
            });

        });



        var yearData = Object.keys(plotMap[0].countData);
        yearData.sort(sortYearData);

        //delete 12/2013
        yearData.splice(yearData.indexOf('12/2013'));

        function sortByYear(a, b) {
            return b.countData[date] - a.countData[date];
        }

        var g2Chart = d3.select(canvas).append("svg");

        var maxCount = d3.max(allCounts);
        var minCount = d3.min(allCounts);

        var colors = d3.scale.linear().domain([minCount, maxCount]).range(["#FFFFFF", "#48008B"]);


        var gridWidth = canvasWidth - paddingleft,
            gridHeight = canvasHeight - paddingBottom,
            barUnit = gridHeight / tagLengthShown;


        g2Chart.attr("viewBox", "0 0 " + canvasWidth + " " + canvasHeight)
            .attr("preserveAspectRatio", "xMidYMid");

        g2Chart.append('rect')
            .attr("width", gridWidth)
            .attr("height", gridHeight)
            .attr("transform", "translate(" + paddingleft + ", 0)");

        var rows = g2Chart.append('g').attr("class", "gridWrapper").attr("transform", "translate(" + paddingleft + ",0)")
            .selectAll("rect")
            .data(plotMap)
            .enter()
            .append("g")
            .attr('class', 'gridRow')
            .attr("transform", function (d, i) {
                return "translate(0 ," + i * barUnit + ")";

            });

        var tileGroup = rows.append("g").attr("class", "tileGroup"),
            yearCount = yearData.length,
            tileWidth = gridWidth / yearCount;

        yearData.forEach(function (year, i) {
            var block = tileGroup.append('g')
                .attr("transform", "translate(" + i * tileWidth + ",0)")
                .on('mouseover', function () {
                    d3.select(this).select('text').style('opacity', '1');

                    d3.select(this.parentNode).transition()
                        .duration(200).ease("easeIn")
                        .attr("transform", "translate(-15,0)");

                    d3.select(this.parentNode.parentNode).select('.tagName').style('fill', 'rgb(0, 255, 41)');
                })
                .on('mouseout', function () {
                    d3.select(this).select('text').style('opacity', '0');

                    d3.select(this.parentNode).transition()
                        .delay(function (d, i) {
                            return i * 10;
                        })
                        .duration(200)
                        .attr("transform", "translate(0,0)");

                    d3.select(this.parentNode.parentNode).select('.tagName').style('fill', '#E7E7E7');
                });

            block.append('rect')
                .attr('class', 'countRect')
                .attr("height", barUnit)
                .attr('width', tileWidth)
                .attr("fill", function (d) {
                    return colors(d.countData[year]);
                });
            block.append('text')
                .attr('class', 'countText')
                .attr("height", barUnit)
                .attr('width', tileWidth).style('opacity', 0)
                .text(function (d) {
                    return d.countData[year];
                })
                .attr("transform", "translate(" + (tileWidth / 2 - 20) + "," + (barUnit - 5) + ")");

        });


        rows.append("text").attr('class', 'tagName')
            .text(function (d) {
                return d.name;
            })
            .attr("transform", function () {
                return "translate(-140 , " + (barUnit / 2 + 10) + ")";
            });


        var labels = g2Chart.append("g").attr("transform", "translate(" + paddingleft + "," + gridHeight + ")").selectAll('rect')
            .data(yearData)
            .enter()
            .append('g')
            .attr("transform", function (d, i) {
                return "translate(" + i * tileWidth + ", 0)";
            });

        labels.append('rect').attr('class', 'sortItem')
            .attr("width", tileWidth)
            .attr("height", 100)
            .attr("fill", "#c6afdb")
            .on("click", function (d) {
                date = d;
                sortChart();
                toggleActive(d3.select(this));
            });

        labels.append('text')
            .text(function (d) {
                var pre = [d.split('/')[0], +(d.split('/')[1]) - 1].join('/');
                return pre + ' - ' + d;
            })
            .attr("transform", "translate(50, 40)")
            .on("click", function (d) {
                date = d;
                sortChart();
                toggleActive(d3.select(this.parentNode).select('.sortItem'));
            });


        function sortChart() {
            rows.sort(sortByYear)
                .transition()
                .delay(function (d, i) {
                    return i * 10;
                })
                .duration(1000)
                .attr("transform", function (d, i) {
                    return "translate(0, " + i * barUnit + ")";
                }).each(function (d, i) {
                    d3.select(this).select('.tagName').style('opacity', function () {
                        return i < tagLengthShown ? 1 : 0;
                    });
                });
        }

        function toggleActive(ele) {
            labels.selectAll('.sortItem').attr("fill", "#AD82D4");
            ele.attr("fill", "#804eaf");
        }

        toggleActive(d3.select('.sortItem'));
        sortChart();

    }

    return render;

});
