'use strict';

var csrf = require('csurf');
var csrfProtection = csrf({cookie: true});

var checkAuth = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    var err = new Error('Access denied');
    err.status = 403;
    next(err);
};

module.exports.checkAuth = checkAuth;
module.exports.csrfProtection = csrfProtection;