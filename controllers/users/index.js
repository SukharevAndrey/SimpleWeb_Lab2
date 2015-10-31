'use strict';

var router = require('express').Router();
var User = require('../../models/user');

var fetchUser = function (req, res, next, username) {
    User.findOne({username: username}, '_id username videos', function (err, user) {
        if (err) {
            next(err);
        }
        else if (user) {
            console.log('Loaded', user);
            req.profileUser = user;
            next();
        }
        else {
            var error = new Error('User does not exist');
            error.status = 404;
            next(error);
        }
    });
};

var profile = function (req, res, next) {
    // TODO: Store only user id and fetch videos on demand
    res.render('profile', {
        profileUser: req.profileUser,
        videos: req.profileUser.videos
    });
};

router.get('/', function (req, res, next) {
    res.send('Users list');
});

router.param('username', fetchUser);
router.get('/:username', profile);


module.exports = router;
