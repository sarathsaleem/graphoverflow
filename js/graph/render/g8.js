/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator , clearInterval , setInterval*/

define(['d3', 'utils/utils'], function (ignore, _util) {

    "use strict";

    d3.sankey = function () {
        var sankey = {},
            nodeWidth = 24,
            nodePadding = 8,
            size = [1, 1],
            nodes = [],
            links = [];

        sankey.nodeWidth = function (_) {
            if (!arguments.length) return nodeWidth;
            nodeWidth = +_;
            return sankey;
        };

        sankey.nodePadding = function (_) {
            if (!arguments.length) return nodePadding;
            nodePadding = +_;
            return sankey;
        };

        sankey.nodes = function (_) {
            if (!arguments.length) return nodes;
            nodes = _;
            return sankey;
        };

        sankey.links = function (_) {
            if (!arguments.length) return links;
            links = _;
            return sankey;
        };

        sankey.size = function (_) {
            if (!arguments.length) return size;
            size = _;
            return sankey;
        };

        sankey.layout = function (iterations) {
            computeNodeLinks();
            computeNodeValues();
            computeNodeBreadths();
            computeNodeDepths(iterations);
            computeLinkDepths();
            return sankey;
        };

        sankey.relayout = function () {
            computeLinkDepths();
            return sankey;
        };

        sankey.link = function () {
            var curvature = .5;

            function link(d) {
                var x0 = d.source.x + d.source.dx,
                    x1 = d.target.x,
                    xi = d3.interpolateNumber(x0, x1),
                    x2 = xi(curvature),
                    x3 = xi(1 - curvature),
                    y0 = d.source.y + d.sy + d.dy / 2,
                    y1 = d.target.y + d.ty + d.dy / 2;
                return "M" + x0 + "," + y0 + "C" + x2 + "," + y0 + " " + x3 + "," + y1 + " " + x1 + "," + y1;
            }

            link.curvature = function (_) {
                if (!arguments.length) return curvature;
                curvature = +_;
                return link;
            };

            return link;
        };

        // Populate the sourceLinks and targetLinks for each node.
        // Also, if the source and target are not objects, assume they are indices.
        function computeNodeLinks() {
            nodes.forEach(function (node) {
                node.sourceLinks = [];
                node.targetLinks = [];
            });
            links.forEach(function (link) {
                var source = link.source,
                    target = link.target;
                if (typeof source === "number") source = link.source = nodes[link.source];
                if (typeof target === "number") target = link.target = nodes[link.target];
                source.sourceLinks.push(link);
                target.targetLinks.push(link);
            });
        }

        // Compute the value (size) of each node by summing the associated links.
        function computeNodeValues() {
            nodes.forEach(function (node) {
                node.value = Math.max(
                    d3.sum(node.sourceLinks, value),
                    d3.sum(node.targetLinks, value)
                );
            });
        }

        // Iteratively assign the breadth (x-position) for each node.
        // Nodes are assigned the maximum breadth of incoming neighbors plus one;
        // nodes with no incoming links are assigned breadth zero, while
        // nodes with no outgoing links are assigned the maximum breadth.
        function computeNodeBreadths() {
            var remainingNodes = nodes,
                nextNodes,
                x = 0;

            while (remainingNodes.length) {
                nextNodes = [];
                remainingNodes.forEach(function (node) {
                    node.x = x;
                    node.dx = nodeWidth;
                    node.sourceLinks.forEach(function (link) {
                        if (nextNodes.indexOf(link.target) < 0) {
                            nextNodes.push(link.target);
                        }
                    });
                });
                remainingNodes = nextNodes;
                ++x;
            }

            //
            moveSinksRight(x);
            scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
        }

        function moveSourcesRight() {
            nodes.forEach(function (node) {
                if (!node.targetLinks.length) {
                    node.x = d3.min(node.sourceLinks, function (d) {
                        return d.target.x;
                    }) - 1;
                }
            });
        }

        function moveSinksRight(x) {
            nodes.forEach(function (node) {
                if (!node.sourceLinks.length) {
                    node.x = x - 1;
                }
            });
        }

        function scaleNodeBreadths(kx) {
            nodes.forEach(function (node) {
                node.x *= kx;
            });
        }

        function computeNodeDepths(iterations) {
            var nodesByBreadth = d3.nest()
                .key(function (d) {
                    return d.x;
                })
                .sortKeys(d3.ascending)
                .entries(nodes)
                .map(function (d) {
                    return d.values;
                });

            //
            initializeNodeDepth();
            resolveCollisions();
            for (var alpha = 1; iterations > 0; --iterations) {
                relaxRightToLeft(alpha *= .99);
                resolveCollisions();
                relaxLeftToRight(alpha);
                resolveCollisions();
            }

            function initializeNodeDepth() {
                var ky = d3.min(nodesByBreadth, function (nodes) {
                    return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
                });

                nodesByBreadth.forEach(function (nodes) {
                    nodes.forEach(function (node, i) {
                        node.y = i;
                        node.dy = node.value * ky;
                    });
                });

                links.forEach(function (link) {
                    link.dy = link.value * ky;
                });
            }

            function relaxLeftToRight(alpha) {
                nodesByBreadth.forEach(function (nodes, breadth) {
                    nodes.forEach(function (node) {
                        if (node.targetLinks.length) {
                            var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
                            node.y += (y - center(node)) * alpha;
                        }
                    });
                });

                function weightedSource(link) {
                    return center(link.source) * link.value;
                }
            }

            function relaxRightToLeft(alpha) {
                nodesByBreadth.slice().reverse().forEach(function (nodes) {
                    nodes.forEach(function (node) {
                        if (node.sourceLinks.length) {
                            var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
                            node.y += (y - center(node)) * alpha;
                        }
                    });
                });

                function weightedTarget(link) {
                    return center(link.target) * link.value;
                }
            }

            function resolveCollisions() {
                nodesByBreadth.forEach(function (nodes) {
                    var node,
                        dy,
                        y0 = 0,
                        n = nodes.length,
                        i;

                    // Push any overlapping nodes down.
                    nodes.sort(ascendingDepth);
                    for (i = 0; i < n; ++i) {
                        node = nodes[i];
                        dy = y0 - node.y;
                        if (dy > 0) node.y += dy;
                        y0 = node.y + node.dy + nodePadding;
                    }

                    // If the bottommost node goes outside the bounds, push it back up.
                    dy = y0 - nodePadding - size[1];
                    if (dy > 0) {
                        y0 = node.y -= dy;

                        // Push any overlapping nodes back up.
                        for (i = n - 2; i >= 0; --i) {
                            node = nodes[i];
                            dy = node.y + node.dy + nodePadding - y0;
                            if (dy > 0) node.y -= dy;
                            y0 = node.y;
                        }
                    }
                });
            }

            function ascendingDepth(a, b) {
                return a.y - b.y;
            }
        }

        function computeLinkDepths() {
            nodes.forEach(function (node) {
                node.sourceLinks.sort(ascendingTargetDepth);
                node.targetLinks.sort(ascendingSourceDepth);
            });
            nodes.forEach(function (node) {
                var sy = 0,
                    ty = 0;
                node.sourceLinks.forEach(function (link) {
                    link.sy = sy;
                    sy += link.dy;
                });
                node.targetLinks.forEach(function (link) {
                    link.ty = ty;
                    ty += link.dy;
                });
            });

            function ascendingSourceDepth(a, b) {
                return a.source.y - b.source.y;
            }

            function ascendingTargetDepth(a, b) {
                return a.target.y - b.target.y;
            }
        }

        function center(node) {
            return node.y + node.dy / 2;
        }

        function value(link) {
            return link.value;
        }

        return sankey;
    };



    var energy = {
        "nodes": [
            {
                "name": "Agricultural"
        },
            {
                "name": "Bio-conversion"
        },
            {
                "name": "Liquid"
        },
            {
                "name": "Losses"
        },
            {
                "name": "Solid"
        }
    ],
        "links": [
            {
                "source": 0,
                "target": 1,
                "value": 10
        },
            {
                "source": 1,
                "target": 2,
                "value": 20
        },
            {
                "source": 1,
                "target": 3,
                "value": 30
        },
            {
                "source": 1,
                "target": 4,
                "value": 50
        }
    ]
    };

    function render(data, canvas) {

        var canvasWidth = 1333.33, //$(canvas).width(),
            canvasHeight = 1000; // $(canvas).height();

        var Chart = d3.select(canvas).append("svg");
        Chart.attr("viewBox", "0 0 " + canvasWidth + " " + canvasHeight)
            .attr("preserveAspectRatio", "xMidYMid");

        var sankey = d3.sankey()
            .size([canvasWidth, canvasWidth])
            .nodeWidth(15)
            .nodePadding(10)
            .nodes(energy.nodes)
            .links(energy.links)
            .layout(32);


        var formatNumber = d3.format(",.0f"),
            format = function (d) {
                return formatNumber(d) + " TWh";
            },
            color = d3.scale.category20();


        var path = sankey.link();

        sankey
            .nodes(energy.nodes)
            .links(energy.links)
            .layout(32);

        var link = Chart.append("g").selectAll(".link")
            .data(energy.links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", path)
            .style("stroke-width", function (d) {
                return Math.max(1, d.dy);
            })
            .sort(function (a, b) {
                return b.dy - a.dy;
            });

        link.append("title")
            .text(function (d) {
                return d.source.name + " → " + d.target.name + "\n" + format(d.value);
            });

        var node = Chart.append("g").selectAll(".node")
            .data(energy.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .call(d3.behavior.drag()
                .origin(function (d) {
                    return d;
                })
                .on("dragstart", function () {
                    this.parentNode.appendChild(this);
                })
                .on("drag", dragmove));

        node.append("rect")
            .attr("height", function (d) {
                return d.dy;
            })
            .attr("width", sankey.nodeWidth())
            .style("fill", function (d) {
                return d.color = color(d.name.replace(/ .*/, ""));
            })
            .style("stroke", function (d) {
                return d3.rgb(d.color).darker(2);
            })
            .append("title")
            .text(function (d) {
                return d.name + "\n" + format(d.value);
            });

        node.append("text")
            .attr("x", -6)
            .attr("y", function (d) {
                return d.dy / 2;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("transform", null)
            .text(function (d) {
                return d.name;
            })
            .filter(function (d) {
                return d.x < canvasHeight / 2;
            })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");

        function dragmove(d) {
            d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(canvasHeight - d.dy, d3.event.y))) + ")");
            sankey.relayout();
            link.attr("d", path);
        }




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
            x = d3.scale.ordinal()
            .domain(d3.range(data.length))
            .rangeBands([0, w + (w / (data.length - 1))], gapratio),
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
        update(true);
        updateNext();


    }
    return render;

});