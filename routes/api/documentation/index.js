'use strict';

var router = require('express').Router(),
 project_route = require('./projects'),
 document_route = require('./documents'),
 method_route = require('./methods'),
 tag_route = require('./tags');

router.use('/projects', project_route);
router.use('/documents', document_route);
router.use('/methods', method_route);
router.use('/tags', tag_route);

module.exports = router;
