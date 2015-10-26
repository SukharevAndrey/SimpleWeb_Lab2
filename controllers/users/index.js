'use strict';

var router = require('express').Router();
var User = require('../../models/user');

var fetchUser = function (req, res, next, username) {
    User.findOne({username: username}, 'username _id', function (err, user) {
        if (err) {
            next(err);
        }
        else if (user) {
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
    res.render('profile', {
        profileUser: req.profileUser
    });
};

router.get('/', function (req, res, next) {
    res.send('Users list');
});

router.param('username', fetchUser);
router.get('/:username', profile);


module.exports = router;
