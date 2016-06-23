var router = require('express').Router();

router.use(function(req,res,next){
  res.send('oops');
});

module.exports = router;
