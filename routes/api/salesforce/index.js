var router = require('express').Router(),
  event_route = require('./events'),
  affiliate_route = require('./affiliates'),
  about_route = require('./about'),
  award_route = require('./awards'),
  workshops_route = require('./workshops');

router.use('/events', event_route)
router.use('/affiliates', affiliate_route)
router.use('/workshops', workshops_route)
router.use('/about', about_route)
router.use('/awards', award_route)

module.exports = router;
