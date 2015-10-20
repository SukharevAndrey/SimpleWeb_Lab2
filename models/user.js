'use strict';

var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var User = new mongoose.Schema({
    username: String,
    passHash: String
});

User.plugin(passportLocalMongoose, {
    usernameField: 'username',
    hashField: 'passHash'
});

module.exports = mongoose.model('User', User);