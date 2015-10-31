'use strict';

var router = require('express').Router();
var passport = require('passport');
var validate = require('validate.js');

var User = require('../models/user');
var config = require('../config');

var csrfProtection = require('../middlewares/auth').csrfProtection;

var authPage = function (req, res) {
    res.render('login', {
        csrfToken: req.csrfToken(),
        flash: {
            notice: req.flash('notice'),
            error: req.flash('error')
        }
    });
};

var registerPage = function (req, res) {
    res.render('register', {
        csrfToken: req.csrfToken(),
        flash: {
            notice: req.flash('notice'),
            error: req.flash('error')
        }
    });
};

var registerUser = function (req, res, next) {
    var errors = validate({
        username: req.body.username,
        password: req.body.password
    }, config.constraints);
    if (errors.username || errors.password) {
        req.flash('error', [errors.username, errors.password].join(','));
        return res.redirect(req.originalUrl);
    }

    User.register(new User({username: req.body.username}),
        req.body.password, function (err) {
            if (err) {
                console.log('Error with user registration: ' + err);
                if (err.name !== 'UserExistsError')
                    return next(err);
                else {
                    req.flash('error', 'User with such name is already existing');
                    return res.redirect(req.originalUrl);
                }
            }

            res.redirect('/');
        });
};

var logIn = function (req, res, next) {
    var errors = validate({
        username: req.body.username,
        password: req.body.password
    }, config.constraints);
    if (errors.username || errors.password) {
        req.flash('error', [errors.username, errors.password].join(','));
        return res.redirect(req.originalUrl);
    }

    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/login');
        }

        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }

            var redirectPath = '/users/' + user.username;
            if (req.session.returnTo)
                redirectPath = req.session.returnTo;

            delete req.session.returnTo;
            return res.redirect(redirectPath);
        });
    })(req, res, next);
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