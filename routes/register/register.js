'use strict'

var _ = require('lodash');
var users = require('../../schemas/domainSchemas/User.js')();
var hasher = require('password-hash');

function _getUsers(req, res) {
    console.info('Loading users');
    users.find({}, function(err, users) {
        res.send(users);
    });

}

function _get(req, res) {
    console.info('Loading register');
    res.sendPage('register');
}

function _post(req, res) {
    console.info("Posted correctly");
    req.assert('emailAddress', 'Email can not be empty').notEmpty();
    req.assert('emailAddress', 'Invalid email').isEmail();
    req.assert('password', 'Password can not be empty').notEmpty();
    req.assert('password', 'Password must have between 6 and 255 characters').len(6,255);
    req.assert('confirm_password', 'Confirm Password can not be empty').notEmpty();
    req.assert('password', 'Password and Confirm password are not the same').same(req.body.confirm_password);

    req.body.password = hasher.generate(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
        res.status(500).send(errors);
    } else {
        var user = users.new(req.body);
        user.save(function (err) {
            if (err) {
                return res.errors(err);
            }
            console.info('User saved.');
            return res.redirect('/home');
        });
    }
}

module.exports = function () {
    return {
        register : function (app) {
            app.post('/register', _post);
            app.get('/register', _get);
            app.get('/users', _getUsers);
        }
    }
};