'use strict';

var router = require('express').Router(),
  Promise = require('bluebird'),
  SF = Promise.promisifyAll(require('../../../../models/sf')),
  cache = Promise.promisifyAll(require('../../../../models/cache')),
  speaker_route = require('./speakers'),
  session_route = require('./sessions'),
  day_route = require('./days'),
  hotel_route = require('./hotels');

router.use('/speakers', speaker_route);
router.use('/sessions', session_route);
router.use('/days', day_route);
router.use('/hotels', hotel_route);

router.route('/')
  .get(function(req, res, next) {
    var filename = 'sf_events';
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = "SELECT Id, Name, Start_Date__c, End_Date__c, Event_Type__c FROM Shingo_Event__c";
      SF.queryAsync(query)
        .then(function(results) {
          var response = {
            success: true,
            events: results.records,
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
  .get(function(req, res,next) {
    var filename = 'sf_events_' + req.params.id;
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = "SELECT Id, Name, Start_Date__c, End_Date__c, Event_Type__c, Banner_URL__c, Sales_Text__c, Display_Location__c, Event_Manager__r.Name, Event_Website__c, Host_City__c, Host_Country__c, Maximum_Registration__c, Primary_Color__c, Printable_Agenda_URL__c, Publish_to_Web_App__c, Registration_Link__c, (SELECT Id, Display_Name__c FROM Shingo_Day_Agendas__r), (SELECT Price__c FROM Shingo_Prices__r WHERE Hotel__c=null) FROM Shingo_Event__c WHERE Id='" + req.params.id + "'";
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
  })
  .post(function(req, res) {
    if (!req.session.access_token) {
      return res.json({
        success: false,
        error: "Not authorized!"
      });
    }

    if (!req.params.id) {
      return res.json({
        success: false,
        error: "Missing parameters..."
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

    if (!req.params.id) {
      return res.json({
        success: false,
        error: "Missing parameters..."
      });
    }

    res.json({
      success: false,
      error: "Not implemented!"
    });
  });

router.get('/next/:next_url', function(req, res) {
  var filename = 'sf_events_next_' + req.params.next_url;
  var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
  if (cache.needsUpdated(filename, 30) || force_refresh) {
    var query = req.params.next_url;
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
});

module.exports = router;
