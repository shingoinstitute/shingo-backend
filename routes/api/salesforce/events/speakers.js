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
    if((req.query.event_id && !pattern.test(req.query.event_id)) || (req.query.session_id && !pattern.test(req.query.session_id)))
      throw Error('Invalid Salesforce Id: ', req.query.event_id);
    var filename = 'sf_speakers' + (req.query.session_id ? "_session_" + req.query.session_id : (req.query.event_id ? "_event_" + req.query.event_id : ""));
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var keynoteSub = new qb().select()
                            .field('Is_Keynote_Speaker__c')
                            .from('Session_Speaker_Associations__r');

      if(req.query.event_id){
        keynoteSub.where([
            {
              "AND": [
                "Is_Keynote_Speaker__c=TRUE",
                "Session__r.Agenda_Day__r.Event__c='" + req.query.event_id + "'"
              ]
            }
          ]);
      } else {
        keynoteSub.where('Is_Keynote_Speaker__c=TRUE');
      }

      var query = new qb().select()
                  .field('Contact__r.Email')
                  .field('Contact__r.LastName')
                  .field('Id')
                  .field('Name')
                  .field('Organization__r.Name')
                  .field('Picture_URL__c')
                  .field('Speaker_Biography__c')
                  .field('Speaker_Title__c')
                  .subQuery(keynoteSub)
                  .from('Shingo_Speaker__c');

      var sessionsSub = new qb().select()
                        .field('Speaker__c')
                        .from('Shingo_Session_Speaker_Association__c');

      if(req.query.session_id){
        sessionsSub.where('Session__c=\'' + req.query.session_id + '\'');
        query.where('Id IN(' + sessionsSub.toString() + ')');
      } else if(req.query.event_id){
        sessionsSub.where('Session__r.Agenda_Day__r.Event__c=\'' + req.query.event_id + '\'');
        query.where('Id IN(' + sessionsSub.toString() + ')');
      }

      logger.log("debug", "SF Speakers query %s", query.toString());

      SF.queryAsync(query.toString())
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
    var pattern = /a[\w\d]{14,17}/;
    if(!pattern.test(req.params.id)) throw Error('Invalid Salesforce Id: ', req.params.id);
    var filename = 'sf_speakers_' + req.params.id;
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = new qb().select()
                  .field('Contact__r.Email')
                  .field('Id')
                  .field('Name')
                  .field('Organization__r.Name')
                  .field('Picture_URL__c')
                  .field('Speaker_Biography__c')
                  .field('Speaker_Title__c')
                  .subQuery(new qb().select()
                                    .field('Session__r.Id')
                                    .field('Session__r.Session_Display_Name__c')
                                    .from('Session_Speaker_Associations__r')
                            )
                  .from('Shingo_Speaker__c')
                  .where('Id=\'' + req.params.id + '\'');
      logger.log("debug", "SF Speaker(%s) query: %s", req.params.id, query.toString());
      SF.queryAsync(query.toString())
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