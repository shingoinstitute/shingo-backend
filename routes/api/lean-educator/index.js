var router = require('express').Router(),
  educator_routes = require('./educator'),
  config = require('../../../config');

router.use('/educators', educator_routes);

module.exports = router;
