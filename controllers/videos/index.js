'use strict';

var router = require('express').Router();

router.get('/', function(request, response) {
    response.send('Videos');
});

module.exports = router;
