'use strict'

var _ = require('lodash');


function _get(req, res) {
    console.info('Loading home');
    var home_merge = _.merge(req.merge, { "show_banner_links": true, "sub_title": "This is the subtitle and go below the title", "header_class":"banner-info"});
    res.sendPage('home', home_merge);
}

module.exports = function () {
    return {
        get:_get
    }
};