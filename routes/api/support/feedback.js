var router = require('express').Router(),
  Feedback = require('../../../models/support').Feedback,
  Logger = require('../../../../Logger.js'),
  logger = new Logger().logger;

router.route('/')
  .get(function (req, res) {
    res.status(404).json({
      success: false,
      error: 'Not implemented'
    });
  })
  .post(function (req, res) {
    logger.log("debug", "POST: /support/feedback (%s)", req.route);
    if (!req.body.description || !req.body.device || !req.body.details || !req.body.rating)
      return res.status(400).json({
        success: false,
        error: "Missing parameters!"
      });
    Feedback.create({
        email: (req.body.email ? req.body.email : "Not Provided"),
        description: req.body.description,
        device: req.body.device,
        details: req.body.details,
        rating: parseFloat(req.body.rating)
      })
      .then(function (feedback) {
        res.status(201).json({
          success: true,
          feedback: feedback
        });
      }).catch(function (err) {
        res.status(400).json({
          success: false,
          error: "Well this is embarassing... There was an error submitting your Feedback! Please email the following to shingo.development@usu.edu so we can fix it!\n" + err
        });
      });
  });

module.exports = router;