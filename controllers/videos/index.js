'use strict';

var multiparty = require('multiparty');              // Module for handling multipart requests
var router = require('express').Router();
var mmm = require('mmmagic'),                        // Library for detecting file type with magic bytes
    Magic = mmm.Magic;
var magic = new Magic(mmm.MAGIC_MIME_TYPE);
var fs = require('fs');                              // File system module
var config = require('../../config');

var checkAuth = require('../../middlewares/auth').checkAuth;
var User = require('../../models/user');


var uploadPage = function (req, res, next) {
    res.render('upload');
};

var fetchAllVideos = function (cb) {
    User
        .aggregate({$unwind: '$videos'})
        .project({
            _id: '$videos._id',
            'username': '$username',
            'title': '$videos.title',
            'uploadDate': '$videos.uploadDate'
        })
        .sort({uploadDate: -1})
        .exec(cb);
};

var findVideoById = function (id, cb) {
    console.log('Searching video with id=' + id);
    User
        .aggregate({$unwind: '$videos'})
        .match({'videos._id': id})
        .project({
            '_id': 0,
            'username': '$username',
            'title': '$videos.title',
            'description': '$videos.description',
            'uploadDate': '$videos.uploadDate',
            'storePath': '$videos.storePath'
        })
        .exec(function (err, videos) {
            if (videos)
                cb(err, videos[0]);
            else
                cb(err, null);
        });
};

var videosPage = function (req, res, next) {
    fetchAllVideos(function (err, videos) {
        if (err)
            next(err);
        res.render('all_videos', {videos: videos});
    });
};

var upload = function (req, res, next) {
    var form = new multiparty.Form({
        uploadDir: config.fileUploadDir,
        maxFilesSize: config.maxFileSize
    });

    form.on('error', function (err) {
        console.log('Error parsing form: ' + err.code + ' ' + err.status + ' ' + err.stack);
        next(err);
    });


    form.parse(req, function (err, fields, files) {
        if (err)
            return next(err);

        console.log('Upload completed');
        var filePath = files.media[0].path;
        magic.detectFile(filePath, function (err, fileType) {
            if (err)
                return next(err);

            if (config.allowedVideoFormats.hasOwnProperty(fileType)) {
                User.update({_id: req.user._id}, {
                    $push: {
                        videos: {
                            title: fields.title,
                            description: fields.description,
                            storePath: filePath
                        }
                    }
                }, function (err, status) {
                    if (err)
                        return next(err);
                    console.log('Upload status: ' + status.toString());
                });
                User.find({_id: req.user.id}, function (err, user) {
                    if (err)
                        next(err);
                    if (user) {
                        res.json({files: files, fields: fields, user: user});
                    }
                    else {
                        res.json({files: files, fields: fields, user: "Not found"});
                    }
                });
            }
            else { // Throwing error and deleting unsupported file
                fs.unlink(filePath, function (err) {
                    if (err)
                        return next(err);
                    console.log('Unsupported file successfully deleted');
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

    findVideoById(req.query.v, function (err, video) {
        if (err)
            return next(err);
        else if (!video) {
            var notFound = new Error('Video not found');
            notFound.status = 404;
            next(notFound);
        }
        else {
            console.log(video);
            res.render('video', {
                title: video.title,
                description: video.description,
                username: video.username,
                uploadDate: video.uploadDate,
                videoUrl: ''
            });
        }
    });
    //res.render('video', {
    //    title: 'Video title, id=' + req.query.v,
    //    description: 'Video description',
    //    videoUrl: '',
    //    username: 'Foo bar'
    //});
};

router.get('/', videosPage);
router.get('/watch', watch);
router.route('/upload')
    .get(checkAuth, uploadPage)
    .post(checkAuth, upload);

module.exports = router;
