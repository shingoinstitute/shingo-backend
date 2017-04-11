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
    var filename = 'sf_hotels' + (req.query.event_id ? "_event_" + req.query.event_id : "");
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var eventsSub = new qb().select()
                      .field('Hotel__c')
                      .from('Shingo_Event_Hotel_Association__c')
                      .where('Event__c=\'' + req.query.event_id + '\'');

      var query = new qb().select()
                  .field('Address__c')
                  .field('Hotel_Phone__c')
                  .field('Hotel_Website__c')
                  .field('Id')
                  .field('Name')
                  .subQuery(new qb().select()
                            .field('Event__r.Id')
                            .field('Event__r.Name')
                            .from('Event_Hotel_Associations__r')
                  )
                  .from('Shingo_Hotel__c')
                  .where((req.query.event_id ? 'Id IN(' + eventsSub.toString() + ')' : ''));

      logger.log("debug", "SF QUERY %s", query.toString());

      SF.queryAsync(query.toString())
        .then(function (results) {
          var response = {
            success: true,
            hotels: results.records,
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
    var filename = 'sf_hotels_' + req.params.id;
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = new qb().select()
                  .field('API_Google_Map__c')
                  .field('Address__c')
                  .field('Code__c')
                  .field('Hotel_Phone__c')
                  .field('Hotel_Website__c')
                  .field('Id')
                  .field('Name')
                  .field('Travel_Information__c')
                  .subQuery(new qb().select()
                            .field('Event__r.Id')
                            .field('Event__r.Name')
                            .from('Event_Hotel_Associations__r')
                  )
                  .subQuery(new qb().select()
                            .field('Price__c')
                            .from('Shingo_Prices__r')
                  )
                  .from('Shingo_Hotel__c')
                  .where('Id=\'' + req.params.id + '\'');

      logger.log("debug", "SF QUERY %s", query.toString());
      
      SF.queryAsync(query.toString())
        .then(function (results) {
          var response = {
            success: true,
            hotel: results.records[0]
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
  var filename = 'sf_hotels_next_' + req.params.next_records;
  var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
  if (cache.needsUpdated(filename, 30) || force_refresh) {
    var query = req.params.next_records;
    SF.queryAsync(query)
      .then(function (results) {
        var response = {
          success: true,
          hotels: results.records,
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