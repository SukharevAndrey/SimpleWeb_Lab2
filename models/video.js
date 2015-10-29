'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Video = new Schema({
    uploadedBy: Schema.Types.ObjectId,
    name: String,
    description: String,
    storePath: String, // Absolute path where file is stored
    uploadDate: Schema.Types.Date
});

module.exports = mongoose.model('Video', Video);