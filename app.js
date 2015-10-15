'use strict';

var express = require('express');                // ExpressJS web framework
var session = require('express-session');        // ExpressJS user session handler
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');              // Advanced MongoDB driver
var logger = require('morgan');                  // Logging all requests
var path = require('path');                      // OS paths
var http = require('http');                      // HTTP protocol support
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

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
app.use(session());

// Configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Configure passport-local to use account model for authentication
var User = require('./models/user');
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/', require('./controllers'));

// Connect mongoose
mongoose.connect('mongodb://localhost/lab2', function(err) {
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