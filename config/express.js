'use strict';

var express = require('express');                 // ExpressJS web framework
var session = require('express-session');         // ExpressJS user session handler
var bodyParser = require('body-parser');          // Request body parser
var cookieParser = require('cookie-parser');      // Simple cookie parser
var path = require('path');                       // OS paths

var configureExpress = function (app) {
    app.use(express.static(path.join(__dirname, 'static')));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser());
    app.use(session({
        secret: app.config.cookieSecret,
        resave: false,
        saveUninitialized: false
    }));
};

module.exports.configureExpress = configureExpress;
