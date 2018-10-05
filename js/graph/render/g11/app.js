/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator , clearInterval , setInterval, d3*/
require.config({
    paths: {
        d3v5: 'libs/d3v5'
    }
});
define(['libs/d3v5', '../g11/timeline', '../g11/mapRight', '../g11/mapLeft', '../g11/compare', '../g11/mapData', 'utils/utils'], function (d3, Timeline, MapRight, MapLeft, Compare, mapData, _util) {
    "use strict";
    // var scroller = new Scroller();
    function render(keralMap, canvas) {

        var timeline = new Timeline(canvas)

        var compare = new Compare();

        var mapRight = new MapRight(keralMap, mapData, canvas);
        var mapLeft = new MapLeft(keralMap, canvas);
        // pass in .step selection as the steps
        $(() => {
            $('.circle-plus').on('click', function () {
                $(this).toggleClass('opened');
                $('.creditsList').slideToggle("slow");
            });


            //     var scroll = scroller.container(d3.select('.g11'))
            //     scroll(d3.selectAll('.step'));
            //     // setup event handling
            //     scroll.on('active', function (index) {
            //         // highlight current step text
            //         console.log(index)
            //     });

            //     scroll.on('progress', function (index, progress) {
            //         //console.log(index, progress);
            //     });
        });
    }

    return render;

});
