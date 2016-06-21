'use strict';

var router = require('express').Router();

router.use(function(req,res){
  res.send('OOOPS');
});

module.exports = router;
