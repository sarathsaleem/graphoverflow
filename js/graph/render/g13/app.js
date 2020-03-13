/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator , clearInterval , setInterval, d3*/
require.config({
    paths: {
        d3v5: "libs/d3v5"
    }
});
define([
    "libs/d3v5",
    "../g13/scroller",
    "utils/utils",
    "../g13/data/allStateDistData"
], function (d3, Scroller, _util) {
    "use strict";

    var scroller = new Scroller();

    function drawPiePerDist(distName, distLangs, svgLayer) {

        console.log(distName);

        let others = 0;
        let langTotal = 0;
        const arcsData = distLangs.top5.map(d => { langTotal += d.T; return d.T; });
        others = distLangs.total - langTotal;
        arcsData.push(others);

        const arcXScale = d3.scaleLinear().range([200, 100]).domain(d3.extent(arcsData));
        const arcs = d3.pie()(arcsData);

        var myColor = d3.scaleOrdinal()
            .domain(d3.extent(arcsData))
            .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), arcsData.length).reverse());


        const arc = d3.arc().innerRadius(50).outerRadius((d) => {
            return arcXScale(d.data);
        });


        svgLayer.selectAll('path.distLangArc').remove();

        svgLayer.selectAll('path.distLangArc')
            .data(arcs)
            .enter()
            .append("path")
            .attr('class', 'distLangArc')
            .attr("d", arc)
            .attr("fill", (d, i) => {
                return myColor(i);//'#' + Math.random().toString(16).substr(-6);
            })
            .attr('transform', 'translate(250, 250)');
        // const piData = new Array(30).fill(0).map((d, i) => 1);



        // const arc = d3.arc().innerRadius(100).outerRadius(300);
        // const arc2 = d3.arc().innerRadius(100).outerRadius(101);

        // const pie = d3.pie();
        // const arcs = d3.pie()(piData);

        // const eleCount = 10;
        // console.time('Canvas Draw')
        // // const arcs = pie([1, 2, 3, 5, 6]);

        // // svg.append('g').style('transform', 'translate(300px, 300px)')
        // const paths = svgLayer.selectAll("path")
        //     .data(arcs)
        //     .enter()
        //     .append("path")
        //     .attr("d", arc)
        //     .attr("fill", function (d, i) {
        //         return myColor(i);
        //     })
        //     .attr('transform', 'translate(250, 250)');
    }

    function render(data, canvas) {

        const distsTopLangs = {};
        const statesData = allStateDistData[0].children;
        statesData.forEach(element => {
            const dists = element.children;
            dists.forEach(dist => {
                dist.children.sort((a, b) => b.T - a.T);
                let total = 0;
                dist.children.forEach(lan => {
                    total += Number(lan.T);
                })

                distsTopLangs[dist.name.trim().toLowerCase()] = {
                    total,
                    top5: dist.children.slice(0, 4)
                };
            });
        });

        function renderUI() {

            const width = 1000;
            const height = 1000;

            const svgLayer = d3.select(canvas).append('svg')
                .attr("viewBox", "0 0 " + width + " " + height)
                .attr("width", 1000)
                .attr("height", 1000);
            //.attr("preserveAspectRatio", "xMidYMid");


            var distColor = d3.scaleSequential().domain([1, 55])
                .interpolator(d3.interpolateCool);

            const langColor = {};
            let allTopLangs = {};
            let counts = 0;

            d3.select("#mapWrapper")
                .selectAll("g")
                .each(function () {
                    //let stateName = d3.select(this).attr("title");
                    d3.select(this)
                        .selectAll("path")
                        .each(function () {
                            if (d3.select(this).attr("title")) {
                                let distName = d3.select(this)
                                    .attr("title")
                                    .trim()
                                    .toLowerCase();
                                if (distsTopLangs[distName]) {
                                    console.log(distName)
                                    if (!allTopLangs[distsTopLangs[distName].top5[0].name]) {
                                        allTopLangs[distsTopLangs[distName].top5[0].name] = {}
                                        langColor[distsTopLangs[distName].top5[0].name] = '#' + Math.random().toString(16).substr(-6);

                                    }
                                    d3.select(this).attr("fill", langColor[distsTopLangs[distName].top5[0].name]);
                                }
                                //drawPiePerDist(distName, distsTopLangs[distName], svgLayer)

                                d3.select(this).on('click', () => {
                                    drawPiePerDist(distName, distsTopLangs[distName], svgLayer)
                                });
                            }
                        })

                });
        }

        $(() => {
            renderUI();
        });
    }

    return render;
});
