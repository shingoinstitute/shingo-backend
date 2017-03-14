'use strict';

var router = require('express').Router(),
  Promise = require('bluebird'),
  path = require('path'),
  SF = Promise.promisifyAll(require(path.join(appRoot, 'models/sf'))),
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
    var filename = 'sf_venues' + (req.query.event_id ? "_event_" + req.query.event_id : "");
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = "SELECT Id, Name, Address__c, API_Google_Map__c, Venue_Location__c, Venue_Type__c, (SELECT Name, Floor__c, URL__c FROM Maps__r), (SELECT Shingo_Event__r.Id, Shingo_Event__r.Name FROM Shingo_Event_Venue_Associations__r), (SELECT Id, Name, Map_X_Coordinate__c, Map_Y_Coordinate__c, Floor__c FROM Shingo_Rooms__r) FROM Shingo_Venue__c" + (req.query.event_id ? " WHERE Id IN(SELECT Shingo_Venue__c FROM Shingo_Event_Venue__c WHERE Shingo_Event__c='" + req.query.event_id + "')" : "");
      logger.log("debug", "SF QUERY %s", query);
      SF.queryAsync(query)
        .then(function (results) {
          var response = {
            success: true,
            venues: results.records,
            total_size: results.totalSize,
            done: results.done,
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
    var filename = 'sf_venues_' + req.params.id;
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = "SELECT Id, Name, Address__c, API_Google_Map__c, Venue_Location__c, Venue_Type__c, (SELECT Name, Floor__c, URL__c FROM Maps__r), (SELECT Shingo_Event__r.Id, Shingo_Event__r.Name FROM Shingo_Event_Venue_Associations__r), (SELECT Id, Name, Map_X_Coordinate__c, Map_Y_Coordinate__c, Floor__c FROM Shingo_Rooms__r) FROM Shingo_Venue__c WHERE Id='" + req.params.id + "'";
      SF.queryAsync(query)
        .then(function (results) {
          var response = {
            success: true,
            venue: results.records[0]
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
  var filename = 'sf_venues_next_' + req.params.next_records;
  var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
  if (cache.needsUpdated(filename, 30) || force_refresh) {
    var query = req.params.next_records;
    SF.queryAsync(query)
      .then(function (results) {
        var response = {
          success: true,
          venues: results.records,
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