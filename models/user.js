'use strict';

var mongoose = require('mongoose');

var User = mongoose.Schema({
    nickname: String,
    birthdate: Date
});

User.plugin(require('passport-local-mongoose'));

module.exports = mongoose.Model('User', User);