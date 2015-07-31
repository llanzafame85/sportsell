"use strict";

var config = require('./config.js')(process.env);

exports.client = function() {
    var redis = require('redis');
    console.info({host: config.redisHost, port: config.redisPort}, 'Connect to redis');
    return require('redis').createClient( config.redisPort, config.redisHost, {detect_buffers: true});
};