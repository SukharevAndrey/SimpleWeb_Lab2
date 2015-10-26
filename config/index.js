'use strict';

exports.port = process.env.PORT || 3000;
exports.dbPath = 'mongodb://localhost/lab2';
exports.cookieSecret = 'verysecret';
exports.maxFileSize = 104857600; // 100 MB
exports.allowedVideoFormats = {'video/mp4': true};
exports.fileUploadDir = './static/uploads';