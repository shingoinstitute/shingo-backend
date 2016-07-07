'use strict';

var router = require('express').Router(),
  Promise = require('bluebird'),
  SF = Promise.promisifyAll(require('../../../../models/sf')),
  cache = Promise.promisifyAll(require('../../../../models/cache'));

router.route('/')
  .get(function(req, res) {
    var filename = 'sf_recipients' + (req.query.event_id ? "_event_" + req.query.event_id : "");
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = "SELECT Id, Organization__r.Name, Organization__r.Logo__c, Award_Type__c FROM Shingo_Recipient__c" + (req.query.event_id ? " WHERE Id IN(SELECT Recipient__c FROM Shingo_Event_Recipient_Association__c WHERE Event__c='" + req.query.event_id + "')" : "");

      SF.queryAsync(query)
        .then(function(results) {
          var response = {
            success: true,
            recipients: results.records,
            total_size: results.totalSize,
            done: results.done,
            next_records: results.nextRecordsUrl
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
  .get(function(req, res) {
    var filename = 'sf_recipients_' + req.params.id;
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = "SELECT Id, Organization__r.Name, Organization__r.Logo__c, Award_Type__c, List_of_Photos__c, List_of_Videos__c, Press_Release__c, Profile__c, Summary__c FROM Shingo_Recipient__c WHERE Id='" + req.params.id + "'";
      SF.queryAsync(query)
        .then(function(results) {
          var response = {
            success: true,
            recipient: results.records[0]
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

router.get('/next/:next_records', function(req, res) {
  var filename = 'sf_recipients_next_' + req.params.next_records;
  var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
  if (cache.needsUpdated(filename, 30) || force_refresh) {
    var query = req.params.next_records;
    SF.queryAsync(query)
      .then(function(results) {
        var response = {
          success: true,
          recipients: results.records,
          done: results.done,
          next_records: results.nextRecordsUrl,
          total_size: results.totalSize
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
});

module.exports = router;
