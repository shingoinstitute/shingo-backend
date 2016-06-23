'use strict';

var router = require('express').Router(),
  models = require('../../../models/documentation');

router.route('/')
  .get(function(req, res){
    models.Method.findAll({include: [{all:true}]})
    .then(function(methods){
      res.json({success: true, methods: methods});
    }).catch(function(err){
      res.json({success: false, error: err})
    });
  })

router.route('/:id')
  .get(function(req, res){
    models.Method.findById(req.params.id, {include: [{all:true}]})
    .then(function(method){
      res.json({success: true, method: method});
    })
    .catch(function(err){
      res.json({success: false, error: err});
    });
  })
  .post(function(req, res){
    if(!req.session.access_token) return res.redirect('/auth');
    var method = req.body.method;

    models.Method.create(method, {include: [models.Tag]}).then(function(method){
      res.json({success: true, method: method});
    }).catch(function(err){
      res.json({success: false, error: err});
    });
  })
  .put(function(req, res){
    if(!req.session.access_token) return res.redirect('/auth');
    var method = req.body.method;
    var id = parseInt(req.params.id);

    models.Method.update(project, {where: {id: id}}).then(function(){
      return models.Method.findById(id, {include: [{all:true}]});
    }).then(function(method){
      res.json({success: true, method: method});
    }).catch(function(err){
      res.json({success: false, error: err});
    });
  })
  .delete(function(req, res){
    if(!req.session.access_token) return res.redirect('/auth');
    models.Method.findById(parseInt(req.params.id))
    .then(function(method){
      return method.destroy();
    }).then(function(affectedRows){
      res.json({success: true, affected_rows: affectedRows});
    }).catch(function(err){
      res.json({succss: false, error: err});
    })
  });


module.exports = router;
