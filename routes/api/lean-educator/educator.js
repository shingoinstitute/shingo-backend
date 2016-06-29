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
        success: true,
        educators: educators
      });
    }).catch(function(err) {
      res.json({
        error: err
      });
    });
})

router.post('/', function(req, res) {
  var educator = req.body.educator;
  console.log("educator.id", educator.id);
  if (educator.id >= 0) {
    Educator.update(educator, {
        where: {
          id: educator.id
        }
      })
      .then(function() {
        res.json({
          success: true,
          educator: educator
        });
      }).catch(function(err) {
        res.json({
          error: err
        });
      });
  } else {
    Educator.create(educator)
      .then(function(educator) {
        res.json({
          success: true,
          educator: educator
        });
      }).catch(function(err) {
        res.json({
          success: false,
          error: err
        });
      });
  }
});

router.delete('/:id', function(req, res) {
  if (!req.session.access_token) {
    return res.json({
      error: "Not authorized..."
    });
  }

  console.log("id:" + req.params.id);
  Educator.destroy({
      where: {
        id: parseInt(req.params.id)
      }
    })
    .then(function() {
      res.json({
        success: true
      });
    })
    .catch(function(err) {
      res.json({
        error: err
      });
    });
});

module.exports = router;
