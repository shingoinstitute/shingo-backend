'use strict';

var router = require('express').Router(),
  Promise = require('bluebird'),
  path = require('path'),
  SF = Promise.promisifyAll(require(path.join(appRoot, 'models/sf'))),
  cache = Promise.promisifyAll(require(path.join(appRoot, 'models/cache'))),
  qb = require(path.join(appRoot, 'models/QueryBuilder')),
  Logger = require(path.join(appRoot, 'Logger.js')),
  logger = new Logger().logger,
  cleaner = require('deep-cleaner');
 
router.route('/')
  .get(function (req, res) {
    var pattern = /a[\w\d]{14,17}/;
    if(req.query.event_id && !pattern.test(req.query.event_id)) throw Error('Invalid Salesforce Id: ', req.query.event_id);
    var filename = 'sf_exhibitors' + (req.query.event_id ? "_event_" + req.query.event_id : "");
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = new qb().select()
                  .field('Id')
                  .field('Organization__r.App_Abstract__c')
                  .field('Organization__r.Logo__c')
                  .field('Organization__r.Name')
                  .from('Shingo_Exhibitor__c')
                  .where((req.query.event_id ? 'Event__c=\'' + req.query.event_id + '\'' : ''));

      logger.log("debug", "SF QUERY %s", query.toString());

      SF.queryAsync(query.toString())
        .then(function (results) {
          var response = {
            success: true,
            exhibitors: results.records,
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
    var pattern = /a[\w\d]{14,17}/;
    if(!pattern.test(req.params.id)) throw Error('Invalid Salesforce Id: ', req.params.id);
    var filename = 'sf_exhibitors_' + req.params.id;
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = new qb().select()
                  .field('Banner_URL__c')
                  .field('Id')
                  .field('Map_Coordinate__c')
                  .field('Notes__c')
                  .field('Organization__r.App_Abstract__c')
                  .field('Organization__r.Logo__c')
                  .field('Organization__r.Name')
                  .field('Organization__r.Public_Contact_Email__c')
                  .field('Organization__r.Website')
                  .from('Shingo_Exhibitor__c')
                  .where('Id=\'' + req.params.id + '\'');

      logger.log("debug", "SF QUERY %s", query.toString());

      SF.queryAsync(query.toString())
        .then(function (results) {
          var response = {
            success: true,
            exhibitor: results.records[0]
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
  var filename = 'sf_exhibitors_next_' + req.params.next_records;
  var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
  if (cache.needsUpdated(filename, 30) || force_refresh) {
    var query = req.params.next_records;
    SF.queryAsync(query)
      .then(function (results) {
        var response = {
          success: true,
          exhibitors: results.records,
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