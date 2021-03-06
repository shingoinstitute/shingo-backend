'use strict';

var router = require('express').Router(),
  Promise = require('bluebird'),
  SF = Promise.promisifyAll(require(path.join(appRoot,'models/sf'))),
  cache = Promise.promisifyAll(require(path.join(appRoot, 'models/cache'))),
  Logger = require(path.join(appRoot, 'Logger.js')),
  logger = new Logger().logger;

router.route('/')
  .get(function (req, res, next) {
    var filename = 'workshops';
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var fields = [
        "Id",
        "Name",
        "Host_Site__c",
        "Start_Date__c",
        "End_Date__c",
        "Event_City__c",
        "Event_Country__c",
        "Organizing_Affiliate__r.Name",
        "Organizing_Affiliate__r.Id",
        "Workshop_Type__c",
        "Registration_Website__c",
        "Additional_Information__c"
      ]
      var query = "SELECT " + fields.join() + " FROM Workshop__c WHERE Public__c=true AND Status__c='Verified'";
      SF.queryAsync(query)
        .then(function (results) {
          var response = {
            success: true,
            workshops: results.records,
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

router.get('/next/:next_records', function (req, res) {
  var filename = 'workshops_next_' + req.params.next_records;
  var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
  if (cache.needsUpdated(filename, 30) || force_refresh) {
    var query = req.params.next_records;
    SF.queryAsync(query)
      .then(function (results) {
        var response = {
          success: true,
          workshops: results.records,
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