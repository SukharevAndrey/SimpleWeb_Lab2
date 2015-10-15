'use strict';

var express = require('express');                // ExpressJS web framework
var session = require('express-session');        // ExpressJS user session handler
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');              // Advanced MongoDB driver
var logger = require('morgan');                  // Logging all requests
var path = require('path');                      // OS paths
var http = require('http');                      // HTTP protocol support

var config = require('./config');      // Dictionary with configuration parameters

// Creating main application
var app = express();
// Storing config in application object
app.config = config;

// Setting path where templates (views) are stored
app.set('views', path.join(__dirname, 'views'));
// Setting Jade as default template engine
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'static')));
app.use(bodyParser.json()); // TODO: do I need it?
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser()); // TODO: options

app.use('/', require('./controllers'));

// Creating a server with application
var server = http.createServer(app);

// Running server
server.listen(app.config.port, function () {
    console.log('Server is running on port ' + app.config.port);
});