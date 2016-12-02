var router = require('express').Router(),
  event_route = require('./events'),
  affiliate_route = require('./affiliates'),
  about_route = require('./about'),
  workshops_route = require('./workshops');

router.use('/events', event_route)
router.use('/affiliates', affiliate_route)
router.use('/workshops', workshops_route)
router.use('/about', about_route)

module.exports = router;
