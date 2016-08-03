var router = require('express').Router(),
    Bug = require('../../../models/support').Bug;

router.route('/')
  .get(function(req, res){
    Bug.findAll().then(function(bugs){
      res.json({success:true, bugs:bugs});
    }).catch(function(err){
      res.status(400).json({success:false, error: err});
    });
  })
  .post(function(req, res){
    console.log("POST: /support/bugs",req.route);
    if(!req.body.email || !req.body.description || !req.body.device || !req.body.details)
      return res.status(400).json({success:false,error:"Missing parameters!"});
    Bug.create({email: req.body.email, description: req.body.description, device: req.body.device, details: req.body.details})
    .then(function(bug){
      res.status(201).json({success:true, bug: bug});
    }).catch(function(err){
      res.status(400).json({success:false, error: "Well this is embarassing... There was an error submitting your bug! Please email the following to shingo.development@usu.edu so we can fix it!\n" + err});
    });
  });

module.exports = router;