'use strict';

var router = require('express').Router();

var ensureAuthenticated = require('../middlewares/auth').checkAuth;

router.use('/users', require('./users'));
router.use('/videos', require('./videos'));
router.use('/api', require('./api'));
router.use('/', require('./auth'));

router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Online theater',
        user: req.user
    });
});

router.get('/secret', ensureAuthenticated, function (req, res, next) {
    res.send('You are authenticated. Good.');
});

// Handling errors such as 404
require('./errors')(router);

module.exports = router;
