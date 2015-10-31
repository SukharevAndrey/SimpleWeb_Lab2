'use strict';

exports.port = process.env.PORT || 3000;
exports.dbPath = 'mongodb://localhost/lab2';
exports.cookieSecret = 'verysecret';
exports.maxFileSize = 104857600; // 100 MB
exports.allowedVideoFormats = {'video/mp4': true};
exports.fileUploadDir = './static/uploads';
exports.minimalUserNameLength = 5;
exports.constraints = {
    username: {
        presence: true,
        length: {
            minimum: 5,
            maximum: 20
        }
    },
    password: {
        presence: true,
        length: {
            minimum: 8,
            maximum: 50
        }
    },
    title: {
        presence: true,
        length: {
            minimum: 5
        }
    }
};