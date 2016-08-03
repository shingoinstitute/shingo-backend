var router = require('express').Router(),
    Feedback = require('../../../models/support').Feedback;

router.route('/')
  .get(function(req, res){
    Feedback.findAll().then(function(feedback){
      res.json({success:true, feedback_list:feedback});
    }).catch(function(err){
      res.status(400).json({success:false, error: err});
    });
  })
  .post(function(req, res){
    console.log("POST: /support/feedback",req.route);
    if(!req.body.description || !req.body.device || !req.body.details || !req.body.rating)
      return res.status(400).json({success:false,error:"Missing parameters!"});
    Feedback.create({email: (req.body.email ? req.body.email : "Not Provided"), description: req.body.description, device: req.body.device, details: req.body.details, rating: parseInt(req.body.rating)})
    .then(function(feedback){
      res.status(201).json({success:true, feedback: feedback});
    }).catch(function(err){
      res.status(400).json({success:false, error: "Well this is embarassing... There was an error submitting your Feedback! Please email the following to shingo.development@usu.edu so we can fix it!\n" + err});
    });
  });

module.exports = router;