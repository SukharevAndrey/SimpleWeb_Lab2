'use strict';

var router = require('express').Router();

var User = require('../models/user');

var ensureAuthenticated = require('../middlewares/auth').checkAuth;
var userAttached = require('../middlewares/user').userAttached;

router.use(userAttached);
router.use('/users', require('./users'));
router.use('/videos', require('./videos'));
router.use('/api', require('./api'));
router.use('/', require('./auth'));

router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Online theater',
        user: req.user,
        flash: {
            notice: req.flash('notice'),
            error: req.flash('error')
        }
    });
});

// quick dirty hack
router.get('/become_moderator', ensureAuthenticated, function (req, res, next) {
    User.update({_id: req.user._id}, {
        $set: {isModerator: true}
    }, function (err, status) {
        if (err)
            next(err);
        req.flash('notice', 'You became a moderator!');
        res.redirect('/');
    });
});

router.get('/secret', ensureAuthenticated, function (req, res, next) {
    res.send('You are authenticated. Good.');
});

// Handling errors such as 404
require('./errors')(router);

module.exports = router;
