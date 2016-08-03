var router = require('express').Router(),
    bug_route = require('./bugs');
    feedback_route = require('./feedback');

router.use('/bugs',bug_route);
router.use('/feedback',feedback_route);

router.use(function(req,res,next){
  res.status(418).send('oops');
});

module.exports = router;
