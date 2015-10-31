'use strict';

var shortid = require('shortid');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Video = new Schema({
    _id: {type: String, unique: true, default: shortid.generate},
    title: String,
    description: String,
    storePath: String, // Absolute path where file is stored
    uploadDate: {type: Schema.Types.Date, default: Date.now},
    size: Schema.Types.Number
});

module.exports = mongoose.model('Video', Video);