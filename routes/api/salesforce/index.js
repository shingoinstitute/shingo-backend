var router = require('express').Router(),
  event_route = require('./events'),
  affiliate_route = require('./affiliates'),
  workshops_route = require('./workshops');  

router.use('/events', event_route);
router.use('/affiliates', affiliate_route);
router.use('/workshops/', workshops_route);

module.exports = router;
