'use strict';

var router = require('express').Router()
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
    models.Project.findById(req.params.id, {include: [{all:true}]})
    .then(function(project){
      res.json({success: true, project: project});
    })
    .catch(function(err){
      res.json({success: false, error: err});
    });
  })
  .use(function(req, res, next){
    if(req.session.access_token){
      next();
    } else {
      res.redirect('/auth');
    }
  })
  .post(function(req, res){
    var project = req.body.project;

    models.Project.create(project).then(function(project){
      res.json({success: true, project: project});
    }).catch(function(err){
      res.json({success: false, error: err});
    });
  })
  .put(function(req, res){
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
    models.findById(parseInt(req.params.id))
    .then(function(project){
      return project.destroy();
    }).then(function(affectedRows){
      res.json({success: true, affected_rows: affectedRows});
    }).catch(function(err){
      res.json({succss: false, error: err});
    })
  });


module.exports = router;
