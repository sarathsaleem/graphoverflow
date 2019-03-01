/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator , clearInterval , setInterval, d3*/
require.config({
    paths: {
        d3v5: 'libs/d3v5'
    }
});
define(['libs/d3v5', '../g12/scroller', '../g12/scattering', 'utils/utils'], function (d3, Scroller, Scattering, _util) {
    "use strict";

    var scroller = new Scroller();
    var scattering = new Scattering();
    function render(data, canvas) {

        $(() => {
            var scroll = scroller.container(d3.select('.g12'))
            scroll(d3.selectAll('.step'));
            // setup event handling
            $('.step').removeClass('active');

            function resetStep3() {
                scattering.stopWave();
                scattering.removePhotons();
            }
            var is3Done = false;
            var posIndex = 0
            scroll.on('active', function (index) {
                // highlight current step text
                console.log(index);
                posIndex = index;
                $('.step').removeClass('active');
                $('.step').eq(index).addClass('active');
                //  .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });

                if (index < 3) {
                    scattering.hideText();
                    resetStep3();
                }

                if (index === 3) {
                    scattering.showText();

                    resetStep3();
                    scattering.showPhotons();
                    setTimeout(function () {
                        if (posIndex === 3) {
                            console.log('Now', index, posIndex)
                            scattering.spreadPhotons();
                        } else {
                            console.log('else Now', index, posIndex)
                        }
                    }, 1000);
                    setTimeout(() => {
                        if (posIndex === 3) {
                            scattering.spreadAsWaves();
                        }
                    }, 1500)
                }

                if (index == 4) {
                    scattering.showPhotonsProgress();
                } else {
                    scattering.stopWave();
                }

                if (index == 5) {
                    scattering.mergePhotons();
                    scattering.showRays();
                } else {
                    //scattering.hideRays();
                }
                if (index < 5) {
                    scattering.hideRays();
                }

                if (index == 6) {
                    scattering.showRays();
                    scattering.scatterPhotons()
                    scattering.showScattering();
                }
                if (index < 6) {
                    scattering.hideScattering();
                }
                if (index === 7) {
                    scattering.showInElasticity();
                }
                if (index === 8) {
                    scattering.hideRays();
                    scattering.arrangeScatteredRays();
                }


                if (index === 9) {
                    scattering.showStoke();
                }
                if (index < 9) {
                    scattering.hideStoke();
                }

                if (index === 10) {
                    scattering.showStoke();
                    scattering.hideEnergyInfo()
                    scattering.showEnergyInfo();
                }
                if (index < 10) {
                    scattering.hideEnergyInfo()
                }

                if (index === 11) {
                    scattering.showStoke();
                    scattering.showIconMove()
                }
                if (index < 11) {
                    scattering.hideSIcon()
                }

                if (index === 12) {
                    scattering.hideEnergyInfo();
                    scattering.hideStoke();
                    scattering.hideSIcon();
                    scattering.hideText();
                }


            });

            scroll.on('progress', function (index, progress) {
                // console.log(index, progress);

            });
        });
    }
    window.onbeforeunload = function () {
        window.scrollTo(0, 0);
    }

    return render;

});
