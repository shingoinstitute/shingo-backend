var router = require('express').Router(),
  academy_route = require('./academy'),
  examiner_route = require('./examiner'),
  staff_route = require('./staff');

router.use('/academy', academy_route)
router.use('/examiner', examiner_route)
router.use('/staff', staff_route)

module.exports = router;
