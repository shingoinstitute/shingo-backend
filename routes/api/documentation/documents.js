'use strict';

var router = require('express').Router(),
  models = require('../../../models/documentation');

router.route('/')
  .get(function(req, res){
    models.Document.findAll({include: [{all:true}]})
    .then(function(docs){
      res.json({success: true, docs: docs});
    }).catch(function(err){
      res.json({success: false, error: err})
    });
  })

router.route('/:id')
  .get(function(req, res){
    models.Document.findById(req.params.id, {include: [{all:true}]})
    .then(function(doc){
      res.json({success: true, doc: doc});
    })
    .catch(function(err){
      res.json({success: false, error: err});
    });
  })
  .post(function(req, res){
    if(!req.session.access_token) return res.redirect('/auth');
    var doc = req.body.doc;

    models.Document.create(doc, {include: [models.Tag]}).then(function(doc){
      res.json({success: true, doc: doc});
    }).catch(function(err){
      res.json({success: false, error: err});
    });
  })
  .put(function(req, res){
    if(!req.session.access_token) return res.redirect('/auth');
    var doc = req.body.doc;
    var id = parseInt(req.params.id);

    models.Document.update(project, {where: {id: id}}).then(function(){
      return models.Document.findById(id, {include: [{all:true}]});
    }).then(function(doc){
      res.json({success: true, doc: doc});
    }).catch(function(err){
      res.json({success: false, error: err});
    });
  })
  .delete(function(req, res){
    if(!req.session.access_token) return res.redirect('/auth');
    models.Document.findById(parseInt(req.params.id))
    .then(function(doc){
      return doc.destroy();
    }).then(function(affectedRows){
      res.json({success: true, affected_rows: affectedRows});
    }).catch(function(err){
      res.json({succss: false, error: err});
    })
  });


module.exports = router;
