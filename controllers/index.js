'use strict';

var router = require('express').Router();

var ensureAuthenticated = require('../middlewares/auth').checkAuth;

router.use('/users', require('./users'));
router.use('/videos', require('./videos'));
router.use('/api', require('./api'));
router.use('/', require('./auth'));

router.get('/', function (request, response) {
    response.render('index', {title: 'Online theater'});
});

router.get('/secret', ensureAuthenticated, function (request, response, next) {
    response.send('You are authenticated. Good.')
});

// Catch 404 and forward to error handler
router.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handling
router.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});

module.exports = router;
