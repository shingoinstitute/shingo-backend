'use strict';

var router = require('express').Router(),
  models = require('../../../models/documentation');

router.route('/')
  .get(function(req, res){
    models.Project.findAll({include: [{all:true}]})
    .then(function(projects){
      res.json({success: true, projects: projects});
    }).catch(function(err){
      res.json({success: false, error: err})
    });
  })

router.route('/:id')
  .get(function(req, res){
    models.Project.findById(parseInt(req.params.id), {include: [{all:true}]})
    .then(function(project){
      res.json({success: true, project: project});
    })
    .catch(function(err){
      res.json({success: false, error: err});
    });
  })
  .post(function(req, res){
    if(!req.session.access_token) return res.redirect('/auth');
    var project = req.body.project;

    models.Project.create(project, {include: [models.Tag]}).then(function(project){
      res.json({success: true, project: project});
    }).catch(function(err){
      res.json({success: false, error: err});
    });
  })
  .put(function(req, res){
    if(!req.session.access_token) return res.redirect('/auth');
    var project = req.body.project;
    var id = parseInt(req.params.id);

    models.Project.update(project, {where: {id: id}}).then(function(){
      return models.Project.findById(id, {include: [{all:true}]});
    }).then(function(project){
      res.json({success: true, project: project});
    }).catch(function(err){
      res.json({success: false, error: err});
    });
  })
  .delete(function(req, res){
    if(!req.session.access_token) return res.redirect('/auth');
    models.Project.findById(parseInt(req.params.id))
    .then(function(project){
      return project.destroy();
    }).then(function(affectedRows){
      res.json({success: true, affected_rows: affectedRows});
    }).catch(function(err){
      res.json({succss: false, error: err});
    })
  });


module.exports = router;
