'use strict';

var express = require('express');                   // ExpressJS web framework
var session = require('express-session');           // ExpressJS user session handler
var bodyParser = require('body-parser');            // Request body parser
var cookieParser = require('cookie-parser');        // Simple cookie parser
var path = require('path');                         // OS paths
var mongoose = require('mongoose');                 // Advanced MongoDB driver
var MongoStore = require('connect-mongo')(session); // MongoDB session storage

var configureExpress = function (app, rootPath) {
    app.use(express.static(path.join(rootPath, 'static')));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser());
    app.use(session({
        secret: app.config.cookieSecret,
        store: new MongoStore({mongooseConnection: mongoose.connection}),
        resave: false,
        saveUninitialized: false
    }));
};

module.exports.configureExpress = configureExpress;
