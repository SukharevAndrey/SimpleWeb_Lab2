'use strict';

var csrf = require('csurf');
var csrfProtection = csrf({cookie: true});

var checkAuth = function (request, response, next) {
    if (request.isAuthenticated())
        return next(); // User can continue doing his actions
    else if (request.method == 'GET')
        request.session.returnTo = request.originalUrl; // Saving where was he when we redirected him
    response.redirect('/login');
};

module.exports.checkAuth = checkAuth;
module.exports.csrfProtection = csrfProtection;