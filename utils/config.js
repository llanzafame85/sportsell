"use strict";

var _ = require('lodash');


module.exports = function(env) {
    var config = _.reduce(
        env,
        function(config, value, key) {
            var match = key.match(/^npm_package_config_(.+)/);
            var ignore = /^(?:stop|start)$/;
            if(!match) {
                return config;
            }
            var new_key = match[1];
            if(new_key.search(ignore) !== -1) {
                return config;
            }
            config[new_key] = value;
            return config;
        },
        {}
    );
    return config;
};
