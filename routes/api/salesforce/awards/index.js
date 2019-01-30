var router = require('express').Router(),
  prize_route = require('./prize'),
  publication_route = require('./publication'),
  research_route = require('./research');
  alumni_route = require('./alumni');

router.use('/prize', prize_route);
router.use('/publication', publication_route);
router.use('/research', research_route);
router.use('/alumni', alumni_route);

module.exports = router;