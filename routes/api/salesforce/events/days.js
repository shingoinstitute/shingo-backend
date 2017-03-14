'use strict';

var router = require('express').Router(),
  Promise = require('bluebird'),
  path = require('path');
var SF = Promise.promisifyAll(require(path.join(appRoot, 'models/sf'))),
  cache = Promise.promisifyAll(require(path.join(appRoot, 'models/cache'))),
  Logger = require(path.join(appRoot, 'Logger.js')),
  logger = new Logger().logger;

function cleanAttributes(obj) {
  Object.keys(obj).forEach(function (key) {
    key === 'attributes' && delete obj[key] ||
      (obj[key] && typeof obj[key] === 'object') && cleanAttributes(obj[key])
  });
  return obj;
};
 
router.route('/')
  .get(function (req, res) {
    var filename = 'sf_days' + (req.query.event_id ? "_event_" + req.query.event_id : "");
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = "Select Id, Name, Display_Name__c, Agenda_Date__c, (SELECT Id FROM Shingo_Sessions__r) FROM Shingo_Agenda_Day__c" + (req.query.event_id ? " WHERE Event__c='" + req.query.event_id + "'" : "");
      SF.queryAsync(query)
        .then(function (results) {
          var response = {
            success: true,
            days: results.records,
            done: results.done,
            totalSize: results.totalSize,
            next_records: results.nextRecordsUrl
          }

          cleanAttributes(response);

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
    var filename = 'sf_days_' + req.params.id;
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = "Select Id, Name, Display_Name__c, (SELECT Id, Name, Session_Display_Name__c, Start_Date_Time__c, End_Date_Time__c, Session_Type__c FROM Shingo_Sessions__r) FROM Shingo_Agenda_Day__c WHERE Id='" + req.params.id + "'";
      SF.queryAsync(query)
        .then(function (results) {
          var response = {
            success: true,
            day: results.records[0]
          }

          cleanAttributes(response);

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
  var filename = 'sf_days_next_' + req.params.next_records;
  var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
  if (cache.needsUpdated(filename, 30) || force_refresh) {
    var query = req.params.next_records;
    SF.queryAsync(query)
      .then(function (results) {
        var response = {
          success: true,
          days: results.records,
          done: results.done,
          next_records: results.nextRecordsUrl,
          total_size: results.totalSize
        }

        cleanAttributes(response);

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