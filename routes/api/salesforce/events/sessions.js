'use strict';

var router = require('express').Router(),
  Promise = require('bluebird'),
  path = require('path'),
  SF = Promise.promisifyAll(require(path.join(appRoot, 'models/sf'))),
  cache = Promise.promisifyAll(require(path.join(appRoot, 'models/cache'))),
  Logger = require(path.join(appRoot, 'Logger.js')),
  logger = new Logger().logger;

router.route('/')
  .get(function (req, res) {
    var filename = 'sf_sessions' + (req.query.agenda_id ? "_agenda_" + req.query.agenda_id : (req.query.event_id ? "_event_" + req.query.event_id : ""));
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = "SELECT Id, Name, Summary__c, Session_Display_Name__c, Start_Date_Time__c, End_Date_Time__c, Publish_to_Web_App__c, Session_Type__c, (SELECT Speaker__r.Id FROM Session_Speaker_Associations__r), Room__r.Id, Room__r.Name, Room__r.Associated_Venue__r.Id, Room__r.Associated_Venue__r.Name, Room__r.Map_X_Coordinate__c, Room__r.Map_Y_Coordinate__c, Room__r.Floor__c FROM Shingo_Session__c" + (req.query.agenda_id ? " WHERE Agenda_Day__c='" + req.query.agenda_id + "'" : (req.query.event_id ? " WHERE Agenda_Day__r.Event__c='" + req.query.event_id + "'" : ""));
      SF.queryAsync(query)
        .then(function (results) {
          var response = {
            success: true,
            sessions: results.records,
            total_size: results.totalSize,
            done: results.done,
            next_records: results.nextRecordsUrl
          }

          res.json(response);
          return cache.addAsync(filename, response);
        })
        .then(function () {
          logger.log("verbose", "Cache updated!");
        })
        .catch(function (err) {
          res.json({
            success: false,
            error: err
          });
        });
    } else {
      res.json(cache[filename]);
    }
  })
  .post(function (req, res) {
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
  .delete(function (req, res) {
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
  .get(function (req, res) {
    var filename = 'sf_sessions_' + req.params.id;
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = "SELECT Id, Name, Session_Display_Name__c, Start_Date_Time__c, End_Date_Time__c, Publish_to_Web_App__c, Session_Type__c, Track__c, Summary__c, Room__r.Name FROM Shingo_Session__c WHERE Id='" + req.params.id + "'";
      SF.queryAsync(query)
        .then(function (results) {
          var response = {
            success: true,
            session: results.records[0]
          }

          res.json(response);
          return cache.addAsync(filename, response);
        })
        .then(function () {
          logger.log("verbose", "Cache updated!");
        })
        .catch(function (err) {
          res.json({
            success: false,
            error: err
          });
        });
    } else {
      res.json(cache[filename]);
    }
  })

router.get('/next/:next_records', function (req, res) {
  var filename = 'sf_sessions_next_' + req.params.next_records;
  var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
  if (cache.needsUpdated(filename, 30) || force_refresh) {
    var query = req.params.next_records;
    SF.queryAsync(query)
      .then(function (results) {
        var response = {
          success: true,
          sessions: results.records,
          done: results.done,
          next_records: results.nextRecordsUrl,
          total_size: results.totalSize
        }

        res.json(response);
        return cache.addAsync(filename, response);
      })
      .then(function () {
        logger.log("verbose", "Cache updated!");
      })
      .catch(function (err) {
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