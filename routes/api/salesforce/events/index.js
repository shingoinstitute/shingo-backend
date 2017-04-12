'use strict';

var router = require('express').Router(),
  Promise = require('bluebird'),
  path = require('path'),
  SF = Promise.promisifyAll(require(path.join(appRoot, 'models/sf'))),
  cache = Promise.promisifyAll(require(path.join(appRoot, 'models/cache'))),
  qb = require(path.join(appRoot, 'models/QueryBuilder')),
  speaker_route = require('./speakers'),
  session_route = require('./sessions'),
  day_route = require('./days'),
  hotel_route = require('./hotels'),
  room_route = require('./rooms'),
  venue_route = require('./venues'),
  exhibitor_route = require('./exhibitors'),
  sponsor_route = require('./sponsors'),
  recipient_route = require('./recipients'),
  Logger = require(path.join(appRoot, 'Logger.js')),
  logger = new Logger().logger,
  cleaner = require('deep-cleaner');

router.use('/speakers', speaker_route);
router.use('/sessions', session_route);
router.use('/days', day_route);
router.use('/hotels', hotel_route);
router.use('/rooms', room_route);
router.use('/venues', venue_route);
router.use('/exhibitors', exhibitor_route);
router.use('/sponsors', sponsor_route);
router.use('/recipients', recipient_route);

router.route('/')
  .get(function (req, res, next) {
    var filename = 'sf_events';
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    var publish_to_web = req.query.publish_to_web ? req.query.publish_to_web : false;
    if (publish_to_web) filename += "_publish";
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = new qb().select()
                    .field('Id')
                    .field('Name')
                    .field('Start_Date__c')
                    .field('End_Date__c')
                    .field('Event_Type__c')
                    .field('Banner_URL__c')
                    .field('Publish_to_Web_App__c')
                    .field('Display_Location__c')
                    .field('Primary_Color__c')
                    .field('Registration_Link__c')
                    .field('Sales_Text__c')
                    .from('Shingo_Event__c')
                    .where((publish_to_web ? "Publish_to_Web_App__c=true": ""));
      logger.log('debug', "SF Query: " + query.toString());              
      SF.queryAsync(query.toString())
        .then(function (results) {
          var response = {
            success: true,
            events: results.records,
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
            error: {
              message: err.message,
              stack: err.stack,
              name: err.name
            }
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
  .get(function (req, res, next) {
    var pattern = /a[\w\d]{14,17}/;
    if(!pattern.test(req.params.id)) throw Error('Invalid Salesforce Id: ', req.params.id);
    var filename = 'sf_events_' + req.params.id;
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = new qb().select()
                  .field('App_Menu_Items__c')
                  .field('Banner_URL__c')
                  .field('Display_Location__c')
                  .field('End_Date__c')
                  .field('Event_Manager__r.Name')
                  .field('Event_Type__c')
                  .field('Event_Website__c')
                  .field('Host_City__c')
                  .field('Host_Country__c')
                  .field('Id')
                  .field('Logo_Large__c')
                  .field('Logo__c')
                  .field('Maximum_Registration__c')
                  .field('Name')
                  .field('Primary_Color__c')
                  .field('Printable_Agenda_URL__c')
                  .field('Publish_to_Web_App__c')
                  .field('Registration_Link__c')
                  .field('Sales_Text__c')
                  .field('Start_Date__c')
                  .field('Video__c')
                  .subQuery(
                    new qb().select()
                    .field('Id')
                    .field('Name')
                    .field('Display_Name__c')
                    .field('Agenda_Date__c')
                    .from('Shingo_Day_Agendas__r')
                  )
                  .subQuery(
                    new qb().select()
                    .field('Price__c')
                    .field('Name')
                    .from('Shingo_Prices__r')
                    .where('Hotel__c=null')
                  )
                  .subQuery(
                    new qb().select()
                    .field('Badge_Name__c')
                    .field('Badge_Title__c')
                    .field('Contact__r.Id')
                    .field('Contact__r.Name')
                    .field('Contact__r.Title')
                    .field('Contact__r.Account.Name')
                    .from('Shingo_Attendees__r')
                  )
                  .subQuery(
                    new qb().select()
                    .field('Id')
                    .field('Name')
                    .field('Event__c')
                    .field('Sponsor__c')
                    .field('Image_URL__c')
                    .field('Ad_Type__c')
                    .from('Sponsor_Ads__r')
                  )
                  .subQuery(
                    new qb().select()
                    .field('Title__c')
                    .field('Content__c')
                    .from('Shingo_Travel_Infos__r')
                  )                  
                  .from('Shingo_Event__c')
                  .where('Id=\'' + req.params.id + '\'');
      logger.log('debug', "SF Query: " + query.toString());
      SF.queryAsync(query.toString())
        .then(function (results) {
          var response = {
            success: true,
            event: results.records[0]
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
  .delete(function (req, res) {
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

router.get('/next/:next_records', function (req, res) {
  var filename = 'sf_events_next_' + req.params.next_records;
  var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
  if (cache.needsUpdated(filename, 30) || force_refresh) {
    var query = req.params.next_records;
    SF.queryAsync(query)
      .then(function (results) {
        var response = {
          success: true,
          events: results.records,
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