'use strict';

var router = require('express').Router();

router.get('/', function (request, response) {
    response.send('Users');
});

router.get('/:user_id', function(request, response) {
    response.send('User ' + request.params.user_id);
});

module.exports = router;
