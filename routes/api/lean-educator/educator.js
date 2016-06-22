var router = require('express').Router(),
  Promise = require('bluebird'),
  Educator = require('../../../models/lean-educator').Educator;

router.get('/', function(req, res) {
  console.log("Getting all educators");
  Educator.findAll({
      order: [
        ['last_name', 'ASC']
      ]
    })
    .then(function(educators) {
      return res.json({
        educators: educators
      });
    }).catch(function(err) {
      res.json({
        error: err
      });
    });
});

router.post('/', function(req, res) {
  console.log("posting educators");
  if (!req.session.access_token) {
    return res.json({error: "Not authorized..."});
  }

  var edited = req.body.edited;

  Promise.map(edited, function(educator) {
    console.log("educator.id", educator.id);
    if (educator.id >= 0) {
      return Educator.update(educator, {
        where: {
          id: educator.id
        }
      });
    } else {
      return Educator.create(educator);
    }
  }).then(function() {
    res.json({
      success: true
    });
  }).catch(function(err) {
    res.json({
      error: err
    });
  });
});

router.delete('/:id', function(req, res){
  if(!req.session.access_token){
    return res.json({error: "Not authorized..."});
  }

  Educator.destroy({where: { id: parseInt(req.params.id) }})
  .then(function(){
    res.json({success:true});
  })
  .catch(function(err){
    res.json({error: err});
  });
});

module.exports = router;