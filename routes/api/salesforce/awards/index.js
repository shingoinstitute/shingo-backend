var router = require('express').Router(),
  publication_route = require('./publication');

router.use('/publication', publication_route)