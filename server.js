'use strict'
var config = require('./utils/config.js')(process.env);

var mongoose = require('mongoose');
mongoose.connect('mongodb://' + config.db_url + '/' + config.db_name);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
   require('./schemas/loadSchemas.js')();
});

var express = require('express'),
    cookieParser = require('cookie-parser');

var app = express();
app.use(cookieParser());

var BODY_LIMIT_KB = 1024 * 1024 * 8;
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: BODY_LIMIT_KB}));
app.use(bodyParser.urlencoded({
    limit: BODY_LIMIT_KB,
    extended: true
}));

process.on('uncaughtException', function (err) {
    console.error('Caught exception: ' + err.stack);
});

var express_validator = require('express-validator');
app.use(express_validator({
        customValidators: {
            gte: function(param, num) {
                return param >= num;
            },
            same: function(param, confirm) {
                return param === confirm;
            }

        }
    })
);
var i18n = require('i18n');
i18n.configure({
    locales:['es', 'en'],
    defaultLocale: 'en',
    cookie: 'lang',
    directory: __dirname + '/locales'
});
config.i18n = i18n.__;
app.use(i18n.init);

var log = require('tracer').console({level:'debug',
    format : "{{timestamp}} <{{title}}> [{{file}}:{{line}}} {{message}} ",
    dateformat : "HH:MM:ss.L"});
var path = require('path');
var routes = require('./routes/routes.js')(app, config);
app.use('/static', express.static(
    path.join(__dirname, './static'), {
        index: false,
        setHeaders: function(res, path) {
            var rel = path.match(/[^\/]+\/[^\/]+$/);
        }
    }
));

global.mongoose = mongoose;
global.uniqueValidator = require('mongoose-unique-validator');

app.use(i18n.init);


console.info = log.info;

console.error = log.error;

console.debug = log.debug;

var server = app.listen(config.app_port, function () {
    console.log('Example app listening at ' + config.app_port);
});