define(['libs/d3v5', 'utils/utils'], function (d3, _util) {

    "use strict";


    function rnd(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }



    return function (canvas) {

        var svgContainer = $('#svgContainer');
        //$(canvas).append(timelineWrapper);

        var width = 1000;
        var height = 1000;
        var marginLeft = 20;
        var marginRight = 50;
        var marginTop = 0;


        var svg = d3.select(svgContainer[0]).append("svg")
            .attr("viewBox", "0 0 " + width + " " + height)
            .attr("preserveAspectRatio", "xMidYMid");
        // .attr('width', width)
        // .attr('height', height + 30);

        var defs = svg.append("defs");
        var marker = defs.append("marker")
        marker.attr("id", "arrow")
            .attr("viewBox", "0 0 12 12")
            .attr("refX", 6)
            .attr("refY", 6)
            .attr("markerUnits", "strokeWidth")
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto");
        marker.append("path")
            .attr("d", "M2,2 L10,6 L2,10 L6,6 L2,2")
            .attr("class", "arrowHead");

        var grid = svg.append('g').attr("class", "gridWrapper").attr("transform", "translate(0,0)");


        var spacing = 60;
        var margin = 400;
        var lines = grid.selectAll('.rays').data([1, 2, 3, 4, 5, 6, 7, 8])
            .enter()
            .append('line')
            .attr("x1", (d) => {
                return margin;
            })
            .attr("y1", (d) => {
                return d * spacing;
            })
            .attr("x2", margin)
            .attr("y2", (d) => {
                return d * spacing;
            })
            .attr("class", 'rays')
            .attr("marker-end", null);

        var pos = [300, 500, 400, 250, 450, 290, 470, 330]
        var circels = grid.selectAll(".objectCircle")
            .data([1, 2, 3, 4, 5, 6, 7, 8])
            .enter().append("circle")
            .attr("r", 0)
            .attr("cx", (d, i) => {
                return margin + pos[i];
            })
            .attr("cy", (d, i) => {
                return d * spacing;
            })
            .attr('class', 'objectCircle');


        this.showRays = function () {

            var t = d3.transition()
                .duration(1000)
                .ease(d3.easeCubicIn);

            lines.attr("marker-end", "url(#arrow)");
            lines.transition(t)
                .attr("x2", (d, i) => {
                    return margin + pos[i] - 33;
                });
            circels.transition(t)
                .attr("r", 30);
        }
        this.hideRays = function () {
            var t = d3.transition()
                .duration(1000)
                .ease(d3.easeCubicOut);
            lines.transition(t)
                .attr("x2", margin)
                .attr("marker-end", null);
            circels.transition(t)
                .attr("r", 0);
        }

        this.hideText = function () {
            $("#descTextSticker").fadeOut();
        }

        this.showText = function () {
            $("#descTextSticker").fadeIn();
        }


        this.drawScatteredRays = function () {
            var randomPos = [
                [100, 150, 30, 10, 0],
                [100, 150, 30, 10, 0],
                [100, 150, 30, 10, 0],
                [100, 150, 30, 10, 0],
                [100, 150, 30, 10, 0],
                [100, 150, 30, 10, 0],
                [100, 150, 30, 10, 0],
                [100, 150, 30, 10, 0],
            ];

            pos.forEach((ele, index) => {
                //svg.selectAll('.sRayGroup').remove();
                var scatterGroup = svg.append('g').attr('class', 'sRayGroup');
                scatterGroup.selectAll('.srays').data([1, 2, 3, 4, 5])
                    .enter()
                    .append('line')
                    .attr("x1", (d, i) => {
                        return margin + ele - 32;
                    })
                    .attr("y1", (d) => {
                        return (index + 1) * spacing;
                    })
                    .attr("x2", (d, i) => {
                        return margin + ele - 32;
                    })
                    .attr("y2", (d) => {
                        return (index + 1) * spacing;
                    })
                    .attr("mx2", (d, i) => {
                        return margin + ele - 100 + (i * 10);
                    })
                    .attr("my2", (d, i) => {
                        return (index * spacing) + randomPos[index][i];
                    })
                    .attr("mx1", (d, i) => {
                        return margin + ele - 32;
                    })
                    .attr("my1", (d, i) => {
                        return (index + 1) * spacing;
                    })
                    .attr("class", 'srays')
                    .attr("marker-end", null);
            })

        }

        this.drawScatteredRays();

        this.showScattering = function () {
            var t = d3.transition()
                .duration(1000)
                .ease(d3.easeCubicOut);

            d3.selectAll('.srays')
                .attr("x1", function (d, i) {
                    return this.getAttribute('mx1');
                })
                .attr("y1", function (d) {
                    return this.getAttribute('my1');
                })
                .attr("x2", function (d, i) {
                    return this.getAttribute('mx1');
                })
                .attr("y2", function (d) {
                    return this.getAttribute('my1');
                })
                .transition(t)
                .attr("x2", function (d, i) {
                    return this.getAttribute('mx2');
                })
                .attr("y2", function (d) {
                    return this.getAttribute('my2');
                })
                .attr('class', 'srays')
                .attr("marker-end", "url(#arrow)");
        }
        this.hideScattering = function () {
            var t = d3.transition()
                .duration(1000)
                .ease(d3.easeCubicOut);
            d3.selectAll('.srays').transition(t)
                .attr("x2", function (d, i) {
                    return this.getAttribute('x1');
                })
                .attr("y2", function (d) {
                    return this.getAttribute('y1');
                })
                .attr('class', 'srays')
                .attr("marker-end", null);
        }

        this.showInElasticity = function () {
            d3.selectAll('.srays').attr('class', (d, i) => {
                var cls = 'srays';
                if (d === 1 || d === 3) {
                    cls = 'srays inelastic';
                }
                return cls;
            })
        }

        this.arrangeScatteredRays = function () {
            var t = d3.transition()
                .duration(1000)
                .ease(d3.easeCubicOut);
            d3.selectAll('.srays').transition(t)
                .attr("x1", function (d, i) {
                    return margin + (i * 15);
                })
                .attr("y1", function (d) {
                    return margin;
                })
                .attr("x2", function (d, i) {
                    return margin + (i * 15);
                })
                .attr("y2", function (d) {
                    if (d == 1) {
                        return margin - 150;
                    }
                    if (d == 3) {
                        return margin - 50;
                    }
                    return margin - 100;
                });

            photons
                .transition(t)
                .attr("cx", function (d, i) {
                    return margin + (i * 15);
                })
                .attr("cy", function (d) {
                    return margin;
                });
        }

        this.showStoke = function () {
            var t = d3.transition()
                .duration(2000)
                .ease(d3.easeCubicOut);
            photons
                .transition(t)
                .attr("cx", function (d, i) {
                    return 1700;
                });
            d3.selectAll('.srays').transition(t)
                .attr("x1", function (d, i) {
                    return 1700;
                })
                .attr("x2", function (d, i) {
                    return 1700;
                })

            svg.selectAll('.srays-clone')
                .data(d3.range(3))
                .enter()
                .append('line')
                .attr('class', (d, i) => {
                    var cls = 'srays-clone';
                    if (d !== 1) {
                        cls = 'srays-clone inelastic';
                    }
                    return cls;
                })
                .attr("x1", function (d, i) {
                    return margin + (i * 15);
                })
                .attr("y1", function (d) {
                    return margin;
                })
                .attr("x2", function (d, i) {
                    return margin + (i * 15);
                })
                .attr("y2", function (d) {
                    if (d == 2) {
                        return margin - 50;
                    }
                    if (d == 0) {
                        return margin - 150;
                    }
                    return margin - 100;
                }).attr("marker-end", "url(#arrow)")
                .transition(t)
                .attr("x1", function (d, i) {
                    return margin + 200 + (i * 50);
                })
                .attr("x2", function (d, i) {
                    return margin + 200 + (i * 50);
                })
                .attr("y2", function (d) {
                    if (d == 2) {
                        return margin - 150;
                    }
                    if (d == 0) {
                        return margin - 300;
                    }
                    return margin - 225;
                });

            svg.selectAll(".photonCircle-Clone").data(d3.range(3))
                .enter().append("circle")
                .attr("r", w / n / 2)
                .attr("cx", function (d, i) {
                    return margin + (i * 15);
                })
                .attr("cy", function (d) {
                    return margin;
                }).attr('class', 'photonCircle-Clone')
                .transition(t)
                .attr("r", 20)
                .attr("cx", function (d, i) {
                    return margin + 200 + (i * 50);
                });

        }

        this.showEnergyInfo = function () {
            var t = d3.transition()
                .duration(1000)
                .ease(d3.easeCubicOut);
            svg.selectAll(".info-line")
                .data(d3.range(3))
                .enter().append('line').attr('class', 'info-line')
                .attr("x1", function (d, i) {
                    return margin + 200 + (i * 50);
                })
                .attr("y1", function (d) {
                    if (d == 2) {
                        return margin - 150;
                    }
                    if (d == 0) {
                        return margin - 300;
                    }
                    return margin - 225;
                })
                .attr("x2", function (d, i) {
                    return margin + 200 + (i * 50);
                })
                .attr("y2", function (d) {
                    if (d == 2) {
                        return margin - 150;
                    }
                    if (d == 0) {
                        return margin - 300;
                    }
                    return margin - 225;
                })
                .transition(t)
                .attr("x2", function (d, i) {
                    return margin + 500;
                });


            svg.append('line').attr('class', 'info-line-spectrum')
                .attr("x1", function (d, i) {
                    return margin + 500;
                })
                .attr("y1", function (d) {
                    return margin - 225;
                })
                .attr("x2", function (d, i) {
                    return margin + 500;
                })
                .attr("y2", function (d) {
                    return margin - 225;
                })
                .attr("marker-end", "url(#arrow)")
                .transition(t)
                .attr("y1", function (d) {
                    return margin - 150;
                })
                .attr("y2", function (d) {
                    return margin - 300;
                })
            // retur
            // searchIcons.transition(t)
            //     .attr("width", 50)
            //     .attr("height", 50);
        }
        this.hideEnergyInfo = function () {
            svg.selectAll(".info-line").remove();
            svg.selectAll(".info-line-spectrum").remove();
        }

        this.showIconMove = function () {
            svg.selectAll(".s-icon").remove();
            var searchIcons = svg.append("svg:image")
                .attr("xlink:href", "../templates/images/g12/search_q.svg")
                .attr("width", 30)
                .attr("height", 30)
                .attr("x", margin + 500)
                .attr("y", margin - 150).attr('class', 's-icon');
            var t = d3.transition()
                .duration(1000)
                .ease(d3.easeCubicOut);
            searchIcons.transition(t)
                .attr("y", margin - 300);

            svg.selectAll(".atomText").remove();
            svg.selectAll(".atomText").data(d3.range(3))
                .enter().append("text").text("Fe")
                .attr("class", "atomText")
                .attr("y", 400)
                .attr("x", 600)
                .style('transform', function (d, i) {
                    return 'translate(' + ((i * 50) - 7) + 'px,6px)'
                });
        }

        this.hideSIcon = function () {
            svg.selectAll(".s-icon").remove();
            svg.selectAll(".atomText").remove();
        }


        this.hideStoke = function () {
            svg.selectAll('.srays-clone').remove();
            svg.selectAll(".photonCircle-Clone").remove();
        }

        var photons;
        var ptGroup = svg.append('g').attr('class', 'photonsGroup');
        var n = 40;
        var w = 500;
        var h = 200;
        var waveTimer;
        this.showPhotons = function () {
            if (photons) {
                photons.remove();
            }
            photons = ptGroup.selectAll(".photonCircle").data(d3.range(n))
                .enter().append("circle")
                .attr("cx", function (d) { return margin + w / 2 })
                .attr("cy", function (d) {
                    return 200 + h / 2;
                })
                .attr("r", 50)
                .attr('class', 'photonCircle');
        }
        this.spreadPhotons = function () {
            photons.transition().duration(500)
                .attr("r", w / n / 2)
                .attr("cx", function (d) {
                    return (margin + (d + 0.5) * w / n);
                })
        }
        this.spreadAsWaves = function () {
            photons.transition().duration(500)
                .attr("cy", function (d) {
                    return (200 + (Math.sin(d / 5 + 1 / 1000)) * h / 4 + h / 2);
                });
        }
        this.showPhotonsProgress = function () {
            photons
                .attr("r", w / n / 2)
                .attr("cx", function (d) {
                    return (margin + (d + 0.5) * w / n);
                })
                .attr("cy", function (d) {
                    return (200 + (Math.sin(d / 5 + 1 / 1000)) * h / 4 + h / 2);
                });
            waveTimer = d3.timer(function (time) {
                svg.selectAll(".photonCircle")
                    // .transition(t)
                    .attr("cy", function (d) {
                        return 200 + (Math.sin(d / 5 + time / 1000)) * h / 4 + h / 2;
                    });
            });


        }
        this.stopWave = function () {
            if (waveTimer) {
                waveTimer.stop();
            }
        }

        this.mergePhotons = function () {
            var t = d3.transition()
                .duration(500)
                .ease(d3.easeCubicOut);

            svg.selectAll(".photonCircle")
                .transition(t)
                .attr("cy", function (d) {
                    return 2 * spacing;
                })
                .attr("cx", function (d) {
                    return (margin + (d + 0.5) * w / n);
                })
        }
        this.scatterPhotons = function () {
            var t = d3.transition()
                .duration(500)
                .ease(d3.easeCubicOut);
            svg.selectAll(".photonCircle")
                .attr("cy", function (d) {
                    return 2 * spacing;
                })
                .attr("cx", function (d) {
                    return (margin + (d + 0.5) * w / n);
                })
                .transition(t)
                .attr("cx", function (d) {
                    return margin + 500;
                });
        }

        this.removePhotons = function () {
            if (photons) {
                photons.remove();
            }

        }



    }
});
