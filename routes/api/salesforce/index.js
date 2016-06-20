var router = require('express').Router(),
  event_route = require('./events'),
  affiliate_route = require('./affiliates');

router.use('/events', event_route);
router.use('/affiliates', affiliate_route);

module.exports = router;
