'use strict';

var multiparty = require('multiparty');              // Module for handling multipart requests
var router = require('express').Router();
var mmm = require('mmmagic'),                        // Library for detecting file type with magic bytes
    Magic = mmm.Magic;
var magic = new Magic(mmm.MAGIC_MIME_TYPE);
var fs = require('fs');                              // File system module
var config = require('../../config');
var checkAuth = require('../../middlewares/auth').checkAuth;

var uploadPage = function (req, res, next) {
    res.render('upload');
};

var videosPage = function (req, res, next) {
    res.render('all_videos');
};

var upload = function (req, res, next) {
    var form = new multiparty.Form({
        uploadDir: config.fileUploadDir,
        maxFilesSize: config.maxFileSize
    });

    form.on('error', function(err) {
        console.log('Error parsing form: ' + err.code + ' ' + err.status + ' '+  err.stack);
        next(err);
    });


    form.parse(req, function (err, fields, files) {
        if (err)
            return next(err);

        console.log('Upload completed');
        var filePath = files.media[0].path;
        magic.detectFile(filePath, function(err, fileType) {
            if (err)
                return next(err);

            if (config.allowedVideoFormats.hasOwnProperty(fileType)) // File type is supported
                res.json({files: files, fields: fields});
            else { // Throwing error and deleting unsupported file
                fs.unlink(filePath, function (err) {
                    if (err)
                        return next(err);
                    console.log('Uploaded unsupported file successfully deleted');
                });

                var invalidTypeError = new Error('Unsupported file type');
                invalidTypeError.status = 415;

                next(invalidTypeError);
            }
        });
    });
};

var watch = function (req, res, next) {
    if (!req.query.hasOwnProperty('v'))
        return res.redirect('./');

    res.render('video', {
        title: 'Video title, id=' + req.query.v,
        description: 'Video description',
        videoUrl: '',
        username: 'Foo bar'
    });
};

router.get('/', videosPage);
router.get('/watch', watch);
router.route('/upload')
    .get(checkAuth, uploadPage)
    .post(checkAuth, upload);

module.exports = router;
