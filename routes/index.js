'use strict';

var express = require('express'),
  router = express.Router(),
  insight_route = express.Router(),
  support_route = express.Router(),
  lean_route = express.Router(),
  admin_route = express.Router(),
  api_route = require('./api'),
  subdomains = require('express-subdomains');

insight_route.use('*', function(req, res){
  res.sendFile(path.join(__dirname, 'public/insight-app/index.html'));
});

support_route.use('*', function(req, res){
  res.sendFile(path.join(__dirname, 'public/support-app/index.html'));
});

lean_route.use('*', function(req, res){
  res.sendFile(path.join(__dirname, 'public/lean-app/index.html'));
});

admin_route.use('*', function(req, res){
  res.sendFile(path.join(__dirname, 'public/admin-app/index.html'));
});

router.use(subdomain('insight'), insight_route);
router.use(subdomain('api'), api_route);
router.use(subdomain('support'), support_route);
router.use(subdomain('lean'), lean_route);
router.use(subdomain('admin'), admin_route);

router.use('*', function(req, res){
  res.sendFile(path.join(__dirname, 'public/app/index.html'));
});

module.exports = router;
