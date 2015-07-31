 'use strict'

var _ = require('lodash');
var users = require('../../schemas/domainSchemas/User.js')();
var hasher = require('password-hash');
var redis = require('../../utils/redis.js').client();

function _getUsers(req, res) {
    console.info('Loading users');
    users.find({}, function(err, users) {
        res.send(users);
    });

}

function _get(req, res) {
    console.info('Loading register');
    if (req.auth_user) {
        return res.redirect('/home');
    } else {
        return res.sendPage('login');
    }
}

function _post(req, res) {
    console.info("Posted correctly");
    req.assert('emailAddress', 'Email can not be empty').notEmpty();
    req.assert('emailAddress', 'Invalid email').isEmail();
    req.assert('password', 'Password can not be empty').notEmpty();
    req.assert('password', 'Password must have between 6 and 255 characters').len(6,255);

    var errors = req.validationErrors();
    if (!errors) {
        users.find({emailAddress:req.body.emailAddress}, function(err, user){
            if (hasher.verify(req.body.password, user[0].password)) {
                return _doLogin(err, user[0], res);
            } else {
                return res.status(500).send([{param:'general',msg:'Invalid username or password'}]);
            }
        });
    } else {
        res.status(500).send(errors);
    }
}

function _doLogin(err, user, res) {
         var sessionId = guid();
         res.cookie('st' , sessionId, { maxAge: 1296000000});
         var cache_key = sessionId;
         var cache_value = {firstName: user.firstName,
             lastName:  user.lastName,
             emailAddress:  user.emailAddress,
             userName: user.userName
         };
         redis.mset(
             cache_key,
             JSON.stringify(cache_value),
             function(error, success) {
                 if(error) {
                     log.error({error: error}, 'cannot write counts to redis');
                 }
                 return res.status(200).send();
             }
         );

 }

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

module.exports = function () {
    return {
        register : function (app) {
            app.post('/login', _post);
            app.get('/login', _get);
        },
        doLogin : _doLogin
    }
};