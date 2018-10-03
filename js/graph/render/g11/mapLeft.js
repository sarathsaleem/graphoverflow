define(['libs/d3v5', 'utils/utils'], function (d3, _util) {

    "use strict";

    return function (keralaMap, canvas) {


        // KERALA  2428.9 1795.4 35 % E
        // 1 ALAPPUZHA  1814.7 1469.1 24 % E
        // 2 ERNAKULAM  2526.1 1767.9 43 % E
        // 3 IDUKKI  3580.6 1967.8 82 % LE
        // 4 KANNUR  2627.8 2448.3 7 % N
        // 5 KASARGOD  2387.4 2744.4 - 13 % N
        // 6 KOLLAM 1588.3 1114.4 43 % E
        // 7 KOTTYAM  2355.0 1626.5 45 % E
        // 8 KOZIKOD 2956.5 2351.9 26 % E
        // 9 MALAPPURAM  2662.8 1849.1 44 % E
        // 10 PALAKKAD 2305.6 1393.5 65 % LE
        // 11 PATTANAMITTIA  1997.9 1449.5 38 % E
        // 12 THIRUVANANTHPURAM  967.3 709.6 36 % E
        // 13 TRISHUR  2088.7 1920.4 9 % N
        // 14 WAYANAD  2948.9 2401.4 23 % E

        var monsoonData = [
            // { "st": "KERALA", "a": 349.7, "n": 98.4, "p": 255 },
            { "st": "Alappuzha", "a": 1814.7, "n": 1469.1, "p": 24 },
            { "st": "Ernakulam", "a": 2526.1, "n": 1767.9, "p": 43 },
            { "st": "Idukki", "a": 3580.6, "n": 1967.8, "p": 82 },
            { "st": "Kannur", "a": 2627.8, "n": 2448.3, "p": 7 },
            { "st": "Kasaragod", "a": 2387.4, "n": 2744.4, "p": -13 },
            { "st": "Kollam", "a": 1588.3, "n": 1114.4, "p": 43 },
            { "st": "Kottayam", "a": 2355.0, "n": 1626.5, "p": 45 },
            { "st": "Kozhikode", "a": 2956.5, "n": 2351.9, "p": 26 },
            { "st": "Malappuram", "a": 2662.8, "n": 1849.1, "p": 44 },
            { "st": "Palakkad", "a": 2305.6, "n": 1393.5, "p": 65 },
            { "st": "Pathanamthitta", "a": 1997.9, "n": 1449.5, "p": 38 },
            { "st": "Thiruvananthapuram", "a": 967.3, "n": 709.6, "p": 36 },
            { "st": "Thrissur", "a": 2088.7, "n": 1920.4, "p": 9 },
            { "st": "Wayanad", "a": 2948.9, "n": 2401.4, "p": 23 }
        ];

        function getDistVal(distName, aOrn) {
            var val = null;
            var dist = monsoonData.filter(function (d) {
                return d.st === distName;
            });
            if (dist.length === 1) {
                val = aOrn === 'a' ? dist[0].a : dist[0].n
            } else {
                console.log(distName)
            }
            return val;
        }


        var width = 300;
        var height = 400;

        var projection = d3.geoMercator()
            .scale(4500)
            .center([76.4, 10.2])
            .translate([130, 230]);

        var path = d3.geoPath()
            .projection(projection);
        //  $(canvas).find('#mapList');
        // Set svg width & height
        var svg = d3.select($(canvas).find('#monsoonDataMap')[0]).append("svg")
            .attr('width', width)
            .attr('height', height);

        var mapLayer = svg.append('g')
            .classed('map-layer', true)
            .attr("transform", "translate(0,0)");


        var tooltip = d3.select("body")
            .append("div")
            .attr('class', "districtInfo");

        var colors = d3.scaleLinear()
            //.domain(d3.extent(totals[year]))
            .domain([960, 3600])
            .range(['#7db9e8', '#1E5799']);

        mapLayer.selectAll('path')
            .data(keralaMap.features)
            .enter().append('path')
            .attr('d', path)
            .attr('vector-effect', 'non-scaling-stroke')
            .attr("id", function (d) {
                return d.properties.Dist_Name;
            })
            .attr("fill", function (d) {
                return colors(getDistVal(d.properties.Dist_Name, 'a'));
            })
            .on('mouseover', function (d, i) {
                tooltip.style("visibility", "visible");
                tooltip.text(d.properties.Dist_Name + " - " + Math.round(getDistVal(d.properties.Dist_Name, 'a')) + "mm");
                d3.select(this).classed('mouseover', true);
            })
            .on("mousemove", function (d) {
                tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
            })
            .on("mouseout", function () {
                tooltip.style("visibility", "hidden");
                d3.select(this).classed('mouseover', false);
            });

        mapLayer.append('text')
            .attr('class', 'colorLabelInfo')
            .text('2018 Monsoon data from June 1 to Aug 31')
            .attr('x', 70)
            .attr('y', 395);
    };
});
