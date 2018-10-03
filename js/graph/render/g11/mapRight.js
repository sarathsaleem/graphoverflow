define(['libs/d3v5', 'utils/utils'], function (d3, _util) {

    "use strict";

    return function (keralaMap, mapData, canvas) {
        var width = 300;
        var height = 400;

        var yearData = {};

        mapData.districtsData.forEach((element) => {
            // Date:"2010M1"
            // Value:9.8
            // districts:"Ernakulam
            var year = element.Date.split('M')[0];
            var month = element.Date.split('M')[1];

            if (element.districts === 'Alapuzha') {
                element.districts = 'Alappuzha';
            }
            if (element.districts === 'Kasargod') {
                element.districts = 'Kasaragod';
            }

            if (yearData[year]) {
                if (yearData[year][element.districts]) {
                    yearData[year][element.districts]['m-' + month] = element.Value;
                } else {
                    yearData[year][element.districts] = {};
                    yearData[year][element.districts]['m-' + month] = element.Value;
                }
            } else {
                yearData[year] = {};
                yearData[year][element.districts] = {};
                yearData[year][element.districts]['m-' + month] = element.Value;
            }

            if (yearData[year][element.districts]['total']) {
                yearData[year][element.districts]['total'] += Number(element.Value);
            } else {
                yearData[year][element.districts]['total'] = Number(element.Value);
            }
        });


        var projection = d3.geoMercator()
            .scale(4500)
            .center([76.4, 10.2])
            .translate([130, 230]);

        var path = d3.geoPath()
            .projection(projection);
        //  $(canvas).find('#mapList');
        // Set svg width & height

        var svg = d3.select($(canvas).find('#yearDataMapHolder')[0]).append("svg")
            .attr('width', width)
            .attr('height', height);

        var mapLayer = svg.append('g')
            .classed('map-layer', true)
            .attr("transform", "translate(0,0)");

        var totals = {};
        var colors = {};

        _util.addGradient(svg._groups[0][0], 'map-year', ['#7db9e8', '#1E5799']);

        var years = Object.keys(yearData);
        //years = years.slice(0, 1);
        var distStat = {}
        var avgs = [];
        years.forEach(function (year) {

            distStat[year] = {
                max: 0,
                min: 1000000,
                distMax: '',
                distMin: ''
            };

            Object.keys(yearData[year]).forEach((dist) => {
                if (totals[year]) {
                    yearData[year][dist]['total'] = Math.round(yearData[year][dist]['total']);
                    totals[year].push(yearData[year][dist]['total']);
                } else {
                    totals[year] = [];
                    totals[year].push(yearData[year][dist]['total']);
                }
                if (yearData[year][dist]['total'] > distStat[year].max) {
                    distStat[year].max = yearData[year][dist]['total'];
                    distStat[year].distMax = dist;
                }
                if (yearData[year][dist]['total'] < distStat[year].min) {
                    distStat[year].min = yearData[year][dist]['total'];
                    distStat[year].distMin = dist;
                }
            });

            yearData[year]['avg'] = Math.round(d3.mean(totals[year]));
            avgs.push(yearData[year]['avg'])
        });

        var tooltip = d3.select("body")
            .append("div")
            .attr('class', "districtInfo");

        var mapColorLabel = svg.append('g')
            .attr("transform", "translate(100,150)");

        mapColorLabel.append('rect')
            .attr('width', 90)
            .attr('height', 10)
            .attr('x', 100)
            .attr('y', 15)
            .attr('fill', function (d) {
                return 'url(#grad-map-year)';
            });

        // mapColorLabel
        //     .append('text')
        //     .attr('class', 'colorLabelInfo')
        //     .text('Year : ' + year)
        //     .attr('x', 100)
        //     .attr('y', 10);

        mapColorLabel
            .append('text')
            .attr('class', 'colorLabelInfo')
            .text(1100)
            .attr('x', 100)
            .attr('y', 35);

        mapColorLabel
            .append('text')
            .attr('class', 'colorLabelInfo')
            .text(4100)
            .attr('x', 167)
            .attr('y', 35);

        svg
            .append('text')
            .attr('class', 'colorLabelInfo')
            .text('Mouseover on districts for info')
            .attr('x', 50)
            .attr('y', 25)
            .style('fill', '#777777');


        $("#yearMenu .yearLabel").on('click', function () {

            $("#yearMenu .yearLabel").removeClass('active');
            $(this).addClass('active');

            var year = $.trim($(this).text());

            $(".yearInfoTable .d_year").text(year);
            $(".yearInfoTable .d_max").text(distStat[year].distMax + ' - ' + distStat[year].max + 'mm');
            $(".yearInfoTable .d_min").text(distStat[year].distMin + ' - ' + distStat[year].min + 'mm');
            $(".yearInfoTable .d_avg").text(yearData[year]['avg'] + 'mm');

            colors[year] = d3.scaleLinear()
                //.domain(d3.extent(totals[year]))
                .domain([1100, 4100])
                .range(['#7db9e8', '#1E5799']);

            //var g = svg.append('g');

            var features = keralaMap.features;

            mapLayer.html("");


            tooltip.style("position", "absolute")
                .style("z-index", "10")
                .style("visibility", "hidden")
            // .text("a simple tooltip");

            mapLayer.selectAll('path')
                .data(features)
                .enter().append('path')
                .attr('d', path)
                .attr('vector-effect', 'non-scaling-stroke')
                .attr("id", function (d) {
                    return d.properties.Dist_Name;
                })
                .attr("fill", function (d) {
                    return colors[year](yearData[year][d.properties.Dist_Name].total)
                }).on('mouseover', function (d, i) {
                    tooltip.style("visibility", "visible");
                    tooltip.text(d.properties.Dist_Name + " - " + Math.round(yearData[year][d.properties.Dist_Name].total) + "mm");
                    d3.select(this).classed('mouseover', true);
                })
                .on("mousemove", function (d) {
                    tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
                })
                .on("mouseout", function () {
                    tooltip.style("visibility", "hidden");
                    d3.select(this).classed('mouseover', false);
                });
        });

        $("#yearMenu .yearLabel:last").trigger("click");

    }

});
