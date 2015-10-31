'use strict';

var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var Video = require('./video');

var User = new mongoose.Schema({
    username: String,
    passHash: String,
    isModerator: {type: Boolean, default: false},
    isAdmin: {type: Boolean, default: false},
    videos: [Video.schema]
});

User.plugin(passportLocalMongoose, {
    usernameField: 'username',
    hashField: 'passHash'
});

module.exports = mongoose.model('User', User);