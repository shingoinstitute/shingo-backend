'use strict';

var router = require('express').Router();

router.use(function(req,res,next){
  res.send("OOOPS!!!!");
});

module.exports = router;
