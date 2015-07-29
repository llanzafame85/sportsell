'use strict'
var app;
var config;
var _ = require('lodash');
var dot = require("dot").process({
    path: (__dirname + "/../views")
});

function loadSchemas() {

    require('./domainSchemas/User.js')().init();

    return 'Schema load Success';
}

module.exports = function () {
    return loadSchemas();
}