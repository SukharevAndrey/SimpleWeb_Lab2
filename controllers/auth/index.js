'use strict';

var router = require('express').Router();
var passport = require('passport');

var User = require('../../models/user');

var csrfProtection = require('../../middlewares/auth').csrfProtection;

var authPage = function (request, response) {
    response.render('login', {csrfToken: request.csrfToken()});
};

var registerPage = function (request, response) {
    response.render('register', {csrfToken: request.csrfToken()});
};

var registerUser = function (request, response, next) {
    User.register(new User({username: request.body.username}),
        request.body.password, function (err) {
            if (err) {
                console.log('Error with user registration: ' + err);
                return next(err);
            }

            response.redirect('/');
        });
};

var logOut = function (request, response, next) {
    request.logout();
    response.redirect('/');
};

router.route('/login')
    .get(csrfProtection, authPage)
    .post(csrfProtection, passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

router.route('/register')
    .get(csrfProtection, registerPage)
    .post(csrfProtection, registerUser);

router.route('/logout')
    .get(logOut);

module.exports = router;