/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator , clearInterval , setInterval*/
define(['d3', 'utils/utils'], function (ignore, _util) {

    "use strict";

    function render(data, canvas) {

        var canvasWidth = 1333.33, //$(canvas).width(),
            canvasHeight = 1000, // $(canvas).height();
            paddingleft = 100, //for label
            paddingBottom = 70,
            plotMap = [],
            horizontals = [],
            allMonthCounts = [],
            allCounts = [],
            tags = Object.keys(data.map);

        Object.keys(data.map).sort().forEach(function (tagName) {

            var oneRowData = {},
                totalCount = {};

            data.map[tagName].forEach(function (row) {
                oneRowData[row.time] = [row.count];
                allMonthCounts.push(row.count);
            });

            Object.keys(oneRowData).reduce(function getGrowth(a, b, i) {
                if (i === 1) {
                    oneRowData[a].push(oneRowData[a][0]);
                    oneRowData[a].push(0);
                }
                oneRowData[b].push((+oneRowData[a][1] + (+oneRowData[b][0])));

                if (oneRowData[a][0] === 0) {
                    oneRowData[b].push(0);
                } else {
                    oneRowData[b].push(((oneRowData[b][0] - oneRowData[a][0]) / oneRowData[a][0]) * 100);

                }

                return b;
            });

            // get all total count
            allCounts.push((oneRowData[Object.keys(oneRowData)[Object.keys(oneRowData).length - 1]][1]));

            horizontals.push(tagName);
            plotMap.push({
                name: tagName,
                countData: oneRowData,
                totalCount: totalCount
            });

        });

        var monthData = Object.keys(plotMap[0].countData).sort();

        //monthData.sort(sortYearData);

        var gridWidth = canvasWidth - paddingleft,
            gridHeight = canvasHeight - paddingBottom,
            spacing = gridWidth / tags.length;

        var Chart = d3.select(canvas).append("svg");
        Chart.attr("viewBox", "0 0 " + canvasWidth + " " + canvasHeight)
            .attr("preserveAspectRatio", "xMidYMid");

        var maxCount = d3.max(allMonthCounts),
            minCount = d3.min(allMonthCounts),
            maxTotal = d3.max(allCounts),
            getPosition = d3.scale.linear().domain([minCount, maxCount]).range([0, gridHeight]),
            getRadius = d3.scale.linear().domain([0, maxTotal]).range([3, 30]),
            getColorScale = d3.scale.category20(),
            colorList = _util.getTagColors();

        //add colors ids
        Object.keys(colorList).forEach(function (tag) {
            _util.addGradient(Chart.selectAll("svg")[0].parentNode, tag, colorList[tag].split(','));

        });

        function getColor(nameOrindex) {
            var name = typeof nameOrindex === 'string' ? nameOrindex : tags[nameOrindex];
            return Object.keys(colorList).indexOf(name) > -1 ? "url(#grad-" + name + ")" : getColorScale(nameOrindex);
        }

        //Bg
        Chart.append('rect')
            .attr("width", canvasWidth)
            .attr("height", gridHeight).style('fill', '#000');

        //Bg left
        /*Chart.append('rect')
            .attr("width", paddingleft)
            .attr("height", gridHeight).style('fill', '#220022');*/

        //Bg bottom
        var bottomPanel = Chart.append('g').attr("transform", "translate(0," + gridHeight + ")");
        bottomPanel.append('rect')
            .attr("width", canvasWidth)
            .attr("height", paddingBottom).style('fill', '#2E062E');

        var grid = Chart.append('g').attr("class", "gridWrapper").attr("transform", "translate(" + paddingleft + ",0)");

        var currentMonth = 0;

        var circles = grid.selectAll('.tags')
            .data(plotMap)
            .enter()
            .append('g')
            .attr("class", "tags")
            .attr("transform", function (d, i) {
                return "translate(" + i * spacing + "," + gridHeight + ")";
            })
            .attr("cx", function (d, i) { // for reff
                return i * spacing;
            })
            .attr("cy", gridHeight); // for reff

        circles.append('circle')
            .attr("r", 0)
            .style("fill", function (d) {
                return getColor(d.name);
            });

        var label = circles.append('text').attr('class', 'tag-label').style("fill", "D0D0D0").text(function (d) {
            return d.name;
        }).style('opacity', '0');


        circles.on('mouseover', function (data) {
            d3.select(this).select('text').style('opacity', 1).text(function () {
                //
                return data.name + " " + data.countData[monthData[currentMonth || 60]][0];
            });
        }).on('mouseout', function () {
            d3.select(this).select('text').style('opacity', 0).text(function () {
                return data.name;
            });
        });


        var monthLabel = Chart.append('text')
            .attr('class', 'month-label')
            .style("font-size", "70px")
            .attr("transform", "translate(75,300) rotate(-90)").on('click', function () {
                stopAnimate();
            });

        var line = grid.append("line")
            .attr("x1", -paddingleft)
            .attr("y1", gridHeight)
            .attr("x2", gridWidth)
            .attr("y2", gridHeight)
            .attr("stroke-width", 1)
            .attr("stroke", "rgba(37, 228, 167, .5)");

        var maxCountLabel = bottomPanel.append('text')
            .attr('class', 'maxcount-label')
            .style("font-size", "30px")
            .attr("transform", "translate(100,45)");

        maxCountLabel.append('tspan').text('Highest');
        maxCountLabel.append('tspan').text('   count : ').style("font-size", "20px");
        maxCountLabel.append('tspan').attr('class', 'max-count').text(0);
        maxCountLabel.append('tspan').text('  date : ').style("font-size", "20px");
        maxCountLabel.append('tspan').attr('class', 'max-month').text(0);
        maxCountLabel.append('tspan').text('  tag : ').style("font-size", "20px");
        maxCountLabel.append('tspan').attr('class', 'max-tag').text('')
            .on('mouseover', function () {
                label.style('opacity', 1);
            })
            .on('mouseout', function () {
                label.style('opacity', 0);
            });

        //arrows
        bottomPanel.append("svg:image")
            .attr('x', canvasWidth - 200)
            .attr('y', 20)
            .attr('width', 32)
            .attr('height', 32).attr("xlink:href", "theme/images/arrow_left.png")
            .on('click', function () {
                currentMonth--;
                moveTag();
            });

        bottomPanel.append("svg:image")
            .attr('x', canvasWidth - 65)
            .attr('y', 20)
            .attr('width', 32)
            .attr('height', 32).attr("xlink:href", "theme/images/arrow_right.png")
            .on('click', function () {
                currentMonth++;
                moveTag();
            });

        var startStop = bottomPanel.append("g")
            .attr("transform", "translate(" + (gridWidth - 60) + ", 25)");

        startStop.append('rect')
            .attr('y', '-5')
            .attr('width', 80)
            .attr('height', 40).attr('rx', 10).attr('ry', 10)
            .on('click', function () {
                startAnimate();
            }).style("fill", "url(#grad-c#)");

        startStop.append('text').text('restart').attr('x', 10).attr('y', 25).style('font-size', '20px')
            .on('click', function () {
                startAnimate();
            });



        var maxData = {
            maxCount: 0
        };

        function moveTag() {

            if (currentMonth >= monthData.length || currentMonth < 0) {
                stopAnimate();
                return;
            }

            var month = monthData[currentMonth];
            var positions = [],
                maxCountOfMonth = 0,
                tagOfMonth = '';

            monthLabel.text(new Date(+month).getMonth() + 1 + " / " + new Date(+month).getFullYear());

            circles.each(function (tag) {
                var count = tag.countData[month][0],
                    total = tag.countData[month][1],
                    pos = gridHeight - getPosition(count);

                if (count > maxCountOfMonth) {
                    maxCountOfMonth = count;
                    tagOfMonth = tag.name;

                    if (count > maxData.maxCount) {
                        maxData.maxCount = count;
                        maxData.tag = tagOfMonth;
                        maxData.month = new Date(+month).getMonth() + 1 + "/" + new Date(+month).getFullYear();
                    }

                }

                positions.push(pos);

                d3.select(this).transition()
                    .duration(400)
                    .attr("transform", function () {
                        return "translate(" + d3.select(this).attr('cx') + "," + pos + ")";
                    });

                d3.select(this).select('circle').attr('r', getRadius(total));

            });

            maxCountLabel.select('.max-count').text(maxData.maxCount);
            maxCountLabel.select('.max-month').text(maxData.month);
            maxCountLabel.select('.max-tag').text(maxData.tag);
            var maxPos = d3.min(positions);
            line.transition()
                .duration(300)
                .attr("x1", -paddingleft)
                .attr("y1", maxPos)
                .attr("x2", gridWidth)
                .attr("y2", maxPos);
        }

        var animate;

        function startAnimate() {
            currentMonth = 0;
            animate = setInterval(function () {
                currentMonth++;
                moveTag();
            }, 300);
        }

        var stopAnimate = function () {
            clearInterval(animate);
            currentMonth = monthData.length - 1;
            maxData.write = true;
        };


        //auto start animation
        startAnimate();

    }

    return render;

});
