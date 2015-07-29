'use strict'

var _ = require('lodash');

function _get(req, res) {
    console.info('Loading about');
    var about_merge = _.merge(req.merge, { "show_banner_links": false,"header_class":"banner-info1"});
    res.sendPage('about', about_merge);
}

module.exports = function () {
    return {
        register : function (app) {
            app.restricted_get('/about', _get);
        }
    }
};