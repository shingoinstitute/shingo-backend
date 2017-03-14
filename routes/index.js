'use strict';

var express = require('express'),
  router = express.Router(),
  path = require('path'),
  insight_route = express.Router(),
  support_route = express.Router(),
  api_route = require('./api'),
  subdomain = require('express-subdomain');

insight_route.get('/', function(req, res, next){
  res.sendFile('/var/www/public/insight-app/index.html');
});

support_route.get('/', function(req, res, next){
  res.sendFile('/var/www/public/support-app/index.html');
});

router.use(subdomain('insight', insight_route));
router.use(subdomain('api', api_route));
router.use(subdomain('support', support_route));

// router.use(function(req, res){
//   res.redirect('api.shingo.org');
// });

router.use('/', api_route);

module.exports = router;
