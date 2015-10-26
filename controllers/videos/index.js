'use strict';

var router = require('express').Router();

router.get('/', function(request, response) {
    response.send('Videos list');
});

module.exports = router;
