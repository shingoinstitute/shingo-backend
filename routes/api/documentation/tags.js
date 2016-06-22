'use strict';

var router = require('express').Router(),
  models = require('../../../models/documentation');

router.route('/')
  .get(function(req, res){
    models.Tag.findAll({include: [{all:true}]})
    .then(function(tags){
      res.json({success: true, tags: tags});
    }).catch(function(err){
      res.json({success: false, error: err})
    });
  })

router.route('/:id')
  .get(function(req, res){
    models.Tag.findById(req.params.id, {include: [{all:true}]})
    .then(function(tag){
      res.json({success: true, tag: tag});
    })
    .catch(function(err){
      res.json({success: false, error: err});
    });
  })
  .post(function(req, res){
    if(!req.session.access_token) return res.redirect('/auth');
    var tag = req.body.tag;

    models.Tag.create(tag).then(function(tag){
      res.json({success: true, tag: tag});
    }).catch(function(err){
      res.json({success: false, error: err});
    });
  })
  .put(function(req, res){
    if(!req.session.access_token) return res.redirect('/auth');
    var tag = req.body.tag;
    var id = parseInt(req.params.id);

    models.Tag.update(project, {where: {id: id}}).then(function(){
      return models.Tag.findById(id, {include: [{all:true}]});
    }).then(function(tag){
      res.json({success: true, tag: tag});
    }).catch(function(err){
      res.json({success: false, error: err});
    });
  })
  .delete(function(req, res){
    if(!req.session.access_token) return res.redirect('/auth');
    models.Tag.findById(parseInt(req.params.id))
    .then(function(tag){
      return tag.destroy();
    }).then(function(affectedRows){
      res.json({success: true, affected_rows: affectedRows});
    }).catch(function(err){
      res.json({succss: false, error: err});
    })
  });


module.exports = router;
