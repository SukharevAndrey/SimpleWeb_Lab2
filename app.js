'use strict';

var express = require('express');                 // ExpressJS web framework
var mongoose = require('mongoose');               // Advanced MongoDB driver
var logger = require('morgan');                   // Logging all requests

var http = require('http');                       // HTTP protocol support
var path = require('path');                       // OS paths

// Dictionary with configuration parameters
var config = require('./config');

// Creating main Express application
var app = express();
// Storing config in the application object
app.config = config;

// Setting logger
app.use(logger('dev'));
// Setting path where templates (views) are stored
app.set('views', path.join(__dirname, 'views'));
// Setting Jade as default template engine
app.set('view engine', 'jade');

// Configuring Express
require('./config/express').configureExpress(app);
// Configuring authentication using Passport module
require('./config/passport').configurePassport(app);

// Connecting route handlers
app.use('/', require('./controllers'));

// Connecting to MongoDB using  mongoose
mongoose.connect(app.config.dbPath, function (err) {
    if (err) {
        console.log('Could not connect to mongodb on localhost. Ensure that you have mongodb running on localhost and mongodb accepts connections on standard ports!');
    }
    else {
        console.log('Connection to MongoDB successful');
    }
});

// Creating a server with application
var server = http.createServer(app);

// Running server
server.listen(app.config.port, function () {
    console.log('Server is running on port ' + app.config.port);
});