/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator */

define(function (require) {

    "use strict";

    var ko = require('knockout');

    var baseUrl = '../js/data/';

    var _u = {
        getData: function (options, callback, scope) {
            var ajaxParams = $.extend({
                url: baseUrl,
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

    };

    var Data = {};
    Data.get = function (name, cb) {
        if (name === 'g1') {
            _u.getData({
                url: baseUrl + 'map.json'
            }, cb, this);


        } else if (name === 'g2') {
            _u.getData({
                url: baseUrl + 'yearly-data.json'
            }, cb, this);


        } else if (name === 'g3') {
            _u.getData({
                url: baseUrl + 'monthly-data.json'
            }, cb, this);


        } else if (name === 'g4') {
            _u.getData({
                url: baseUrl + 'month.json'
            }, cb, this);


        } else if (name === 'g6') {
            _u.getData({
                url: baseUrl + 'git-data.json'
            }, cb, this);


        } else if (name === 'g7') {
            _u.getData({
                url: baseUrl + 'git-day.json'
            }, cb, this);


        } else if (name === 'g8') {
            _u.getData({
                url: baseUrl + '27-club.json'
            }, cb, this);


        } else if (name === 'g9') {
            _u.getData({
                url: baseUrl + 'p-table.json'
            }, cb, this);


        } else {

            cb.call(this, []);
        }



    };

    return Data;
});
