'use strict';

var express = require('express'),
  router = express.Router(),
  path = require('path'),
  insight_route = express.Router(),
  subdomain = require('express-subdomain');

module.exports = function (passport) {
  var api_route = require('./api')(passport);
  
  insight_route.get('/', function (req, res, next) {
    res.sendFile('/var/www/public/insight-app/index.html');
  });

  router.use(subdomain('insight', insight_route));
  router.use(subdomain('api', api_route));

  return router;
}