/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator , clearInterval , setInterval*/

define(['d3', 'utils/utils'], function (ignore, _util) {

    "use strict";


    function render(data, canvas) {

        var canvasWidth = 1333.33, //$(canvas).width(),
            canvasHeight = 1000; // $(canvas).height();

        var Chart = d3.select(canvas).append("svg");
        Chart.attr("viewBox", "0 0 " + canvasWidth + " " + canvasHeight)
            .attr("preserveAspectRatio", "xMidYMid");

        /* Make Fake Data */

        var data = (function () {
            var maxt = 5,
                maxn = 12,
                maxl = 4,
                maxv = 10,
                times = [],
                allLinks = [],
                counter = 0,
                addNodes = function () {
                    var ncount = Math.random() * maxn + 1,
                        nodes = d3.range(0, ncount).map(function (n) {
                            return {
                                id: counter++,
                                nodeName: "Node " + n,
                                nodeValue: 0,
                                incoming: []
                            }
                        });
                    times.push(nodes);
                    return nodes;
                },
                addNext = function () {
                    var current = times[times.length - 1],
                        nextt = addNodes();
                    // make links
                    current.forEach(function (n) {
                        var linkCount = Math.min(~~(Math.random() * maxl + 1), nextt.length),
                            breaks = d3.range(linkCount - 1)
                            .map(function () {
                                return Math.random() * n.nodeValue
                            })
                            .sort(d3.ascending),
                            links = {},
                            target, link, x;
                        for (x = 0; x < linkCount; x++) {
                            do {
                                target = nextt[~~(Math.random() * nextt.length)];
                            } while (target.id in links);
                            // add link
                            link = {
                                source: n.id,
                                target: target.id,
                                value: (breaks[x] || n.nodeValue) - (breaks[x - 1] || 0)
                            };
                            links[target.id] = link;
                            allLinks.push(link);
                            target.nodeValue += link.value;
                        }
                    });
                    // prune next
                    times[times.length - 1] = nextt.filter(function (n) {
                        return n.nodeValue
                    });
                }
                // initial set
            addNodes().forEach(function (n) {
                n.nodeValue = Math.random() * maxv + 1;
            });
            // now add rest
            for (var t = 0; t < maxt - 1; t++) {
                addNext();
            }

            return {
                times: times,
                links: allLinks
            };
        })();

        /* Process Data */

        // make a node lookup map
        var nodeMap = (function () {
            var nm = {};
            data.times.forEach(function (nodes) {
                nodes.forEach(function (n) {
                    nm[n.id] = n;
                    // add links and assure node value
                    n.links = [];
                    n.incoming = [];
                    n.nodeValue = n.nodeValue || 0;
                })
            });
            return nm;
        })();

        // attach links to nodes
        data.links.forEach(function (link) {
            nodeMap[link.source].links.push(link);
            nodeMap[link.target].incoming.push(link);
        });

        // sort by value and calculate offsets
        data.times.forEach(function (nodes) {
            var cumValue = 0;
            nodes.sort(function (a, b) {
                return d3.descending(a.nodeValue, b.nodeValue)
            });
            nodes.forEach(function (n, i) {
                n.order = i;
                n.offsetValue = cumValue;
                cumValue += n.nodeValue;
                // same for links
                var lCumValue;
                // outgoing
                if (n.links) {
                    lCumValue = 0;
                    n.links.sort(function (a, b) {
                        return d3.descending(a.value, b.value)
                    });
                    n.links.forEach(function (l) {
                        l.outOffset = lCumValue;
                        lCumValue += l.value;
                    });
                }
                // incoming
                if (n.incoming) {
                    lCumValue = 0;
                    n.incoming.sort(function (a, b) {
                        return d3.descending(a.value, b.value)
                    });
                    n.incoming.forEach(function (l) {
                        l.inOffset = lCumValue;
                        lCumValue += l.value;
                    });
                }
            })
        });
        data = data.times;

        // calculate maxes
        var maxn = d3.max(data, function (t) {
                return t.length
            }),
            maxv = d3.max(data, function (t) {
                return d3.sum(t, function (n) {
                    return n.nodeValue
                })
            });

        /* Make Vis */

        // settings and scales
        var w = 1400,
            h = 500,
            gapratio = .7,
            delay = 1500,
            padding = 15,
            x = d3.scale.ordinal().domain(d3.range(data.length)).rangeBands([0, w + (w / (data.length - 1))], gapratio),
            y = d3.scale.linear()
            .domain([0, maxv])
            .range([0, h - padding * maxn]),
            line = d3.svg.line()
            .interpolate('basis');

        // root
        var vis = Chart;


        var t = 0;

        function update(first) {
            // update data
            var currentData = data.slice(0, ++t);

            // time slots
            var times = vis.selectAll('g.time')
                .data(currentData)
                .enter().append('svg:g')
                .attr('class', 'time')
                .attr("transform", function (d, i) {
                    return "translate(" + (x(i) - x(0)) + ",0)"
                });

            // node bars
            var nodes = times.selectAll('g.node')
                .data(function (d) {
                    return d
                })
                .enter().append('svg:g')
                .attr('class', 'node');

            setTimeout(function () {
                nodes.append('svg:rect')
                    .attr('fill', 'steelblue')
                    .attr('y', function (n, i) {
                        return y(n.offsetValue) + i * padding;
                    })
                    .attr('width', x.rangeBand())
                    .attr('height', function (n) {
                        return y(n.nodeValue)
                    })
                    .append('svg:title')
                    .text(function (n) {
                        return n.nodeName
                    });
            }, (first ? 0 : delay));

            var linkLine = function (start) {
                return function (l) {
                    var source = nodeMap[l.source],
                        target = nodeMap[l.target],
                        gapWidth = x(0),
                        bandWidth = x.rangeBand() + gapWidth,
                        startx = x.rangeBand() - bandWidth,
                        sourcey = y(source.offsetValue) +
                        source.order * padding +
                        y(l.outOffset) +
                        y(l.value) / 2,
                        targety = y(target.offsetValue) +
                        target.order * padding +
                        y(l.inOffset) +
                        y(l.value) / 2,
                        points = start ? [
                        [startx, sourcey], [startx, sourcey], [startx, sourcey], [startx, sourcey]
                    ] : [
                        [startx, sourcey],
                        [startx + gapWidth / 2, sourcey],
                        [startx + gapWidth / 2, targety],
                        [0, targety]
                    ];
                    return line(points);
                }
            }
            // links
            var links = nodes.selectAll('path.link')
                .data(function (n) {
                    return n.incoming || []
                })
                .enter().append('svg:path')
                .attr('class', 'link')
                .style('stroke-width', function (l) {
                    return y(l.value)
                })
                .attr('d', linkLine(true))
                .on('mouseover', function () {
                    d3.select(this).attr('class', 'link on')
                })
                .on('mouseout', function () {
                    d3.select(this).attr('class', 'link')
                })
                .transition()
                .duration(delay)
                .attr('d', linkLine());

        }

        function updateNext() {
            if (t < data.length) {
                update();
                window.setTimeout(updateNext, delay)
            }
        }
       // update(true);
       // updateNext();


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
                .duration(delay)
                .attr('d', drawPath());



    }
    return render;

});
