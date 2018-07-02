'use strict';

var express = require('express'),
  router = express.Router(),
  api_route = require('./api'),
  subdomain = require('express-subdomain');

router.use(subdomain('api', api_route));
router.use('/api', api_route);

module.exports = router;
