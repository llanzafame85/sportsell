'use strict'
var app;
var config;
var _ = require('lodash');
var dot = require("dot").process({
    path: (__dirname + "/../views")
});
var redis = require('../utils/redis.js').client();

function loadApp() {

    app.use(function header(req, res, next) {
            req.merge = _.merge({title:"My pr","active_path":req.url}, req.merge);
            next();
        }
    );

    app.use(function signin(req, res, next) {
            if (req.cookies.st && !(req.path.indexOf('/static')===0)) {
                redis.get(
                    req.cookies.st,
                    function(error, data) {
                        if(error) {
                            log.error({error: error, text: 'cannot read inquiries from redis'});
                        } else {
                            req.auth_user = data;
                            req.merge = _.merge({user:JSON.parse(data)});
                        }
                        return next();
                    }
                );
            } else {
                return next();
            }
        }
    );


    app.use(function footer(req, res, next) {
            req.merge = _.merge({tale:"My links"}, req.merge);
            next();
        }
    );

    app.use(function easyRender(req, res, next) {
        res.sendPage = function (template, args) {
            var params = _.merge({i18n:res.__}, args);
            res.send(dot.main({"body": dot[template](params)}));
        };
        next();
    });


    app.use(function onError(req, res, next) {
        res.errors = function (err, args) {
            var errs = [];
            _.forEach(err.errors, function (erro) {
                errs.push({param:erro.path, msg:erro.message});
            });
            return res.status(500).send(errs);
        };
        next();
    });

    app.restricted_get = function (path, callback) {
        app.get(path, function (req, res) {
            return authenticate(req, res, callback);
        });
    };

    app.restricted_post = function (path, callback) {
        app.post(path, function (req, res) {
            return authenticate(req, res, callback);
        });
    };

    function authenticate(req, res, callback) {
        if (req.auth_user) {
            return callback(req, res);
        } else {
            return res.send(403).send();
        }
    }

    app.get('/home', require('./home/home.js')().get);

    require('./about/about.js')().register(app);

    require('./register/register.js')().register(app);

    require('./login/login.js')().register(app);

    app.get('/', function(req, res){return res.redirect(301,'/home')});
}

module.exports = function (application, conf) {
    app = application;
    config = conf
    loadApp();
}