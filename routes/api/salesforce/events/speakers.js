'use strict';

var router = require('express').Router(),
  Promise = require('bluebird'),
  path = require('path'),
  SF = Promise.promisifyAll(require(path.join(appRoot, 'models/sf'))),
  cache = Promise.promisifyAll(require(path.join(appRoot, 'models/cache'))),
  Logger = require(path.join(appRoot, 'Logger.js')),
  logger = new Logger().logger,
  cleaner = require('deep-cleaner');
 
router.route('/')
  .get(function (req, res) {
    var filename = 'sf_speakers' + (req.query.session_id ? "_session_" + req.query.session_id : (req.query.event_id ? "_event_" + req.query.event_id : ""));
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = "SELECT Id, Name, Speaker_Title__c, Picture_URL__c, Speaker_Biography__c, Contact__r.Email, Contact__r.LastName, Organization__r.Name, (SELECT Is_Keynote_Speaker__c FROM Session_Speaker_Associations__r WHERE Is_Keynote_Speaker__c=TRUE" + (req.query.event_id ? " AND Session__r.Agenda_Day__r.Event__c='" + req.query.event_id + "')" : ")") + "FROM Shingo_Speaker__c" + (req.query.session_id ? " WHERE Id IN(SELECT Speaker__c FROM Shingo_Session_Speaker_Association__c WHERE Session__c='" + req.query.session_id + "')" : (req.query.event_id ? " WHERE Id IN(SELECT Speaker__c FROM Shingo_Session_Speaker_Association__c WHERE Session__r.Agenda_Day__r.Event__c='" + req.query.event_id + "')" : ""));
      logger.log("debug", "SF Speakers query %s", query);

      SF.queryAsync(query)
        .then(function (results) {
          var response = {
            success: true,
            speakers: results.records,
            total_size: results.totalSize,
            done: results.done,
            next_records: results.nextRecordsUrl
          }

          cleaner(response, 'attributes');

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
    var filename = 'sf_speakers_' + req.params.id;
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = "SELECT Id, Name, Speaker_Title__c, Picture_URL__c, Speaker_Biography__c, Contact__r.Email, Organization__r.Name, (SELECT Session__r.Id, Session__r.Session_Display_Name__c FROM Session_Speaker_Associations__r) FROM Shingo_Speaker__c WHERE Id='" + req.params.id + "'";
      logger.log("debug", "SF Speaker(%s) query: %s", req.params.id, query);
      SF.queryAsync(query)
        .then(function (results) {
          var response = {
            success: true,
            speaker: results.records[0]
          }

          cleaner(response, 'attributes');

          res.json(response);
          return cache.addAsync(filename, response);
        })
        .then(function () {
          logger.log("verbose", "Cache updated!");
        })
        .catch(function (err) {
          logger.log('error', JSON.stringify(err));
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
  var filename = 'sf_speakers_next_' + req.params.next_records;
  var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
  if (cache.needsUpdated(filename, 30) || force_refresh) {
    var query = req.params.next_records;
    SF.queryAsync(query)
      .then(function (results) {
        var response = {
          success: true,
          speakers: results.records,
          done: results.done,
          next_records: results.nextRecordsUrl,
          total_size: results.totalSize
        }

        cleaner(response, 'attributes');

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