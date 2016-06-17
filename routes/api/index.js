'use strict';

var router = require('express').Router(),
  user_api = require('./user'),
  sf_api = require('./salesforce'),
  support_api = require('./support'),
  lean_api = require('./lean-educator'),
  admin_api = require('./admin');

router.use('/user', user_api);
router.use('/salesforce', sf_api);
router.use('/support', support_api);
router.use('/lean-educator', lean_api);
router.use('/admin', admin_api);

module.exports = router;
