'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var configurePassport = function (app) {
    app.use(passport.initialize());
    app.use(passport.session());

    // requires the model with Passport-Local Mongoose plugged in
    var User = require('../models/user');

    // Ise static authenticate method of model in LocalStrategy
    passport.use(new LocalStrategy(User.authenticate()));

    // Use static serialize and deserialize of model for passport session support
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

};

exports.configurePassport = configurePassport;