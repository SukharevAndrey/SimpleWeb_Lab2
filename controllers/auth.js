'use strict';

var router = require('express').Router();
var passport = require('passport');

var User = require('../models/user');

var csrfProtection = require('../middlewares/auth').csrfProtection;

var authPage = function (req, res) {
    res.render('login', {csrfToken: req.csrfToken()});
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

var logIn = function (request, response, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return response.redirect('/login');
        }
        request.logIn(user, function (err) {
            if (err) {
                return next(err);
            }

            var redirectPath = '/users/' + user.username;
            if (request.session.returnTo)
                redirectPath = request.session.returnTo;

            delete request.session.returnTo;
            return response.redirect(redirectPath);
        });
    })(request, response, next);
};

var logOut = function (request, response, next) {
    request.logout();
    response.redirect('/');
};

router.route('/login')
    .get(csrfProtection, authPage)
    .post(csrfProtection, logIn);

router.route('/register')
    .get(csrfProtection, registerPage)
    .post(csrfProtection, registerUser);

router.route('/logout')
    .get(logOut);

module.exports = router;