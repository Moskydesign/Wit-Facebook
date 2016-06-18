'use strict';

function call(call, callback, context, cb) {
    var http = require('http');

    var options = {
        host: 'bobbejaanbot.webhosting.be',
        port: 80,
        path: call,
        method: 'GET'
    };

    http.request(options, function(res) {

        res.setEncoding('utf8');
        res.on('data', function (data) {

            // Return data to callback function
            callback(data, context, cb);

        });
    }).end();
}

function getForecast(data, callback, context, cb) {
    var http = require('http');

    var options = {
        host: 'api.openweathermap.org',
        port: 80,
        path: '/data/2.5/weather?q=' + data + '&APPID=c0831363cb2c8d6377869d42384308fe',
        method: 'GET'
    };

    http.request(options, function(res) {

        res.setEncoding('utf8');
        res.on('data', function (data) {
            // Return data to callback function
            callback(data, context, cb);
        });
    }).end();
}

module.exports.call = call;
module.exports.getForecast = getForecast;