'use strict';

var multiparty = require('multiparty');              // Module for handling multipart requests
var router = require('express').Router();
var mmm = require('mmmagic'),                        // Library for detecting file type with magic bytes
    Magic = mmm.Magic;
var magic = new Magic(mmm.MAGIC_MIME_TYPE);
var fs = require('fs');                              // File system module
var path = require('path');
var validate = require('validate.js');
var config = require('../../config');

var authMiddlewares = require('../../middlewares/auth');
var checkAuth = authMiddlewares.checkAuth;

var User = require('../../models/user');


var uploadPage = function (req, res, next) {
    res.render('upload', {
        flash: {
            notice: req.flash('notice'),
            error: req.flash('error')
        }
    });
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
            'id': '$videos._id',
            'username': '$username',
            'title': '$videos.title',
            'description': '$videos.description',
            'uploadDate': '$videos.uploadDate',
            'storePath': '$videos.storePath',
            'fileSize': '$videos.size'
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
        res.render('all_videos', {
            videos: videos,
            flash: {
                notice: req.flash('notice'),
                error: req.flash('error')
            }
        });
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

        console.log(fields.title[0]);
        var errors = validate({title: fields.title[0]}, config.constraints);
        if (errors.title) {
            req.flash('error', errors.title);
            return res.redirect(req.originalUrl);
        }

        console.log('Upload completed');
        var filePath = files.media[0].path;
        var fileSize = files.media[0].size;
        magic.detectFile(filePath, function (err, fileType) {
            if (err)
                return next(err);

            if (config.allowedVideoFormats.hasOwnProperty(fileType)) {
                User.update({_id: req.user._id}, {
                    $push: {
                        videos: {
                            title: fields.title,
                            description: fields.description,
                            storePath: filePath,
                            size: fileSize
                        }
                    }
                }, function (err, status) {
                    if (err)
                        return next(err);
                    console.log('Upload status: ' + status.toString());
                    req.flash('notice', 'You have successfully uploaded video');
                    res.redirect(req.originalUrl);
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
            console.log('Video found in database');
            console.log(video);

            var currentUser = null;
            if (req.user)
                currentUser = req.user.username;
            var isModerator = false;
            if (req.user)
                isModerator = req.user.isModerator

            res.render('video', {
                title: video.title,
                description: video.description,
                username: video.username,
                uploadDate: video.uploadDate,
                videoId: video.id,
                videoUrl: path.join('files', path.basename(video.storePath)),
                currentUserName: currentUser,
                isModerator: isModerator
            });
        }
    });
};

var streamVideo = function (req, res, next) {
    console.log('Streaming requested. Filename: ' + req.params.fileName);
    var videoPath = path.resolve(path.join('static', 'uploads', req.params.fileName));

    fs.stat(videoPath, function (err, stats) {
        if (err)
            return next(err);

        var fileSize = stats.size;
        console.log('Video with size ' + fileSize + ' is found on server');

        if (req.headers['range']) {
            var range = req.headers.range,
                parts = range.replace(/bytes=/, "").split("-"),
                partialstart = parts[0],
                partialend = parts[1],
                start = parseInt(partialstart, 10),
                end = partialend ? parseInt(partialend, 10) : fileSize - 1,
                chunksize = (end - start) + 1;

            var file = fs.createReadStream(videoPath, {start: start, end: end});

            res.status(206);
            res.header({
                'Content-Range': 'bytes ' + start + '-' + end + '/' + fileSize,
                'Accept-Ranges': 'bytes', 'Content-Length': chunksize,
                'Content-Type': 'video/mp4'
            });
            file.pipe(res)
        }
        else {
            res.status(200);
            res.header({
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4'
            });
            fs.createReadStream(videoPath).pipe(res)
        }
    });
};

var deleteVideo = function (req, res, next) {
    var videoId = req.params.videoId;

    findVideoById(videoId, function (err, video) {
        if (err)
            return next(err);
        else if (!video) {
            var notFound = new Error('Video not found');
            notFound.status = 404;
            next(notFound);
        }
        else {
            if (video.username == req.user.username || req.user.isModerator || req.user.isAdmin) {
                console.log('Deleting video');
                User.update({'videos._id': videoId}, {
                    $pop: {
                        videos: {_id: videoId}
                    }
                }, function (err, status) {
                    if (err)
                        next(err);
                    console.log('Delete status: ' + status);
                    req.flash('notice', 'Video has been deleted');
                    res.redirect('/videos');
                });
                // TODO: Delete video files (or not?)
            }
            else {
                console.log('Deleting prohibited');
                var accessError = new Error('Access denied');
                return next(accessError);
            }
        }
    });


};

router.get('/', videosPage);
router.get('/watch', watch);
router.route('/upload')
    .get(checkAuth, uploadPage)
    .post(checkAuth, upload);
router.get('/files/:fileName', streamVideo);
router.get('/delete/:videoId', checkAuth, deleteVideo);

module.exports = router;
