'use strict';

var router = require('express').Router();

module.exports = function (passport) {
  var linkedin = require('./linkedin')(passport);
  var local = require('./local.js')(passport);
  router.use('/linkedin', linkedin);
  router.use('/local', local);

  return router;
}