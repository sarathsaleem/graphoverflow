/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator */

define(['data/index'], function (Data) {

    "use strict";

    function getAjaxData(options, callback, scope) {

        var url = '../data/';

        var ajaxParams = $.extend({
            url: '',
            async: false,
            contentType: "application/json",
            dataType: 'json',
            success: function (json) {
                scope = scope || window;
                callback.apply(scope, [json]);
            },
            error: function (e) {
                console.log(e.message);
            }
        }, options);
        $.ajax(ajaxParams);
    }

    var dal = {};
    dal.stackData = {};


    //g1
    dal.stackData.get = function (graphName, callback) {

        Data.get(graphName, callback);
        //getAjaxData()
    };

    return dal;

});
