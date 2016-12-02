var router = require('express').Router(),
  academy_route = require('./academy');

router.use('/academy', academy_route)

module.exports = router;
