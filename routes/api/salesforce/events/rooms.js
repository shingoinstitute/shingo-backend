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
    console.log("Rooms route");
    var filename = 'sf_rooms' + (req.query.venue_id ? "_venue_" + req.query.venue_id : "");
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = "SELECT Id, Name, Associated_Venue__r.Name FROM Shingo_Room__c" + (req.query.venue_id ? " WHERE Associated_Venue__c='" + req.query.venue_id + "'" : "");

      SF.queryAsync(query)
        .then(function (results) {
          var response = {
            success: true,
            rooms: results.records,
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
    var filename = 'sf_rooms_' + req.params.id;
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = "SELECT Id, Name, Associated_Venue__r.Id, Associated_Venue__r.Name, Map_Coordinate__c FROM Shingo_Room__c WHERE Id='" + req.params.id + "'";

      SF.queryAsync(query)
        .then(function (results) {
          var response = {
            success: true,
            room: results.records[0]
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

router.get('/next/:next_records', function (req, res) {
  var filename = 'sf_rooms_next_' + req.params.next_records;
  var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
  if (cache.needsUpdated(filename, 30) || force_refresh) {
    var query = req.params.next_records;

    SF.queryAsync(query)
      .then(function (results) {
        var response = {
          success: true,
          rooms: results.records,
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