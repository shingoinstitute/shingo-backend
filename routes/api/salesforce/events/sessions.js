'use strict';

var router = require('express').Router(),
  Promise = require('bluebird'),
  SF = Promise.promisifyAll(require('../../../../models/sf')),
  cache = Promise.promisifyAll(require('../../../../models/cache'));

router.route('/')
  .get(function(req,res){
    var filename = 'sf_sessions';
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = "SELECT Id, Name, Session_Display_Name__c, Start_Date_Time__c, End_Date_Time__c, Publish_to_Web_App__c, Session_Type__c FROM Shingo_Session__c";
      SF.queryAsync(query)
        .then(function(results) {
          var response = {
            success: true,
            speakers: results.records,
            done: results.done,
            next_url: results.nextRecordsUrl
          }

          res.json(response);
          return cache.addAsync(filename, response);
        })
        .then(function() {
          console.log("Cache updated!");
        })
        .catch(function(err) {
          res.json({
            success: false,
            error: err
          });
        });
    } else {
      res.json(cache[filename]);
    }
  })
  .post(function(req, res) {
    if (!req.session.access_token) {
      return res.json({
        success: false,
        error: "Not authorized!"
      });
    }

    res.json({
      success: false,
      error: "Not implemented!"
    });
  })
  .delete(function(req, res) {
    if (!req.session.access_token) {
      return res.json({
        success: false,
        error: "Not authorized!"
      });
    }

    res.json({
      success: false,
      error: "Not implemented!"
    });
  });

router.route('/:id')
  .get(function(req,res){
    var filename = 'sf_sessions' + req.params.id;
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = "SELECT Id, Name, Session_Display_Name__c, Start_Date_Time__c, End_Date_Time__c, Publish_to_Web_App__c, Session_Type__c, Track__c, Summary__c, Room__r.Name FROM Shingo_Session__c WHERE Id='" + req.params.id + "'";
      SF.queryAsync(query)
        .then(function(results) {
          var response = {
            success: true,
            speaker: results.records[0]
          }

          res.json(response);
          return cache.addAsync(filename, response);
        })
        .then(function() {
          console.log("Cache updated!");
        })
        .catch(function(err) {
          res.json({
            success: false,
            error: err
          });
        });
    } else {
      res.json(cache[filename]);
    }
  })

  router.get('/next/:next_url'){
    var filename = 'sf_sessions_next_' + req.params.next_url;
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = req.params.next_url);
      SF.queryAsync(query)
        .then(function(results) {
          var response = {
            success: true,
            event: {}
          }

          response.event = results.records[0];

          res.json(response);
          return cache.addAsync(filename, response);
        })
        .then(function() {
          console.log("Cache updated!");
        })
        .catch(function(err) {
          res.json({
            success: false,
            error: err
          });
        });
    } else {
      res.json(cache[filename]);
    }
  }

module.exports = router;
