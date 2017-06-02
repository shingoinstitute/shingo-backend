var router = require('express').Router(),
  publication_route = require('./publication'),
  research_route = require('./research');

router.use('/publication', publication_route);
router.use('/research', research_route);

module.exports = router;