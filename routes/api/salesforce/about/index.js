var router = require('express').Router(),
  academy_route = require('./academy'),
  examiner_route = require('./examiner'),
  staff_route = require('./staff'),
  seab_route = require('./seab');

router.use('/academy', academy_route)
router.use('/examiner', examiner_route)
router.use('/staff', staff_route)
router.use('/seab', seab_route)

module.exports = router;
