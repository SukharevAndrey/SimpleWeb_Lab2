'use strict';

var applyErrorHandlers = function (router) {
    // error handler
    router.use(function (err, req, res, next) {
        if (err.code !== 'EBADCSRFTOKEN')
            return next(err);

        // handle CSRF token errors here
        res.status(403);
        res.send('session has expired or form tampered with');
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
};

module.exports = applyErrorHandlers;