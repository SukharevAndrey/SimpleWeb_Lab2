'use strict';

var userAttached = function (req, res, next) {
    res.locals.user = req.user;
    next();
};

module.exports.userAttached = userAttached;