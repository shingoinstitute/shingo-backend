'use strict';

var router = require('express').Router(),
  Promise = require('bluebird'),
  facilitators_route = require('./facilitators'),
  SF = Promise.promisifyAll(require('../../../../models/sf')),
  cache = Promise.promisifyAll(require('../../../../models/cache'));

router.use('/facilitators', facilitators_route)

router.route('/')
  .get(function(req, res, next) {
    var filename = 'affiliates';
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = "SELECT Id, Name, Logo__c, Page_Path__c, Website, App_Abstract__c, Languages__c FROM Account WHERE RecordType.Name='Licensed Affiliate' AND (NOT Name LIKE 'McKinsey%')";
      SF.queryAsync(query)
        .then(function(results) {
          var response = {
            success: true,
            affiliates: results.records,
            total_size: results.totalSize,
            done: results.done,
            next_records: results.nextRecordsUrl
          }

          res.json(response);
          return cache.addAsync(filename, response);
        })
        .then(function() {
          console.log("Cache updated!");
        })
        .catch(function(err) {
          res.json({
            success: false,
            error: err
          });
        });
    } else {
      res.json(cache[filename]);
    }
  })
  .post(function(req, res) {
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
  .delete(function(req, res) {
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
  .get(function(req, res,next) {
    var filename = 'affiliates_' + req.params.id;
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = "SELECT Id, Name, Logo__c, Page_Path__c, Website, App_Abstract__c, Languages__c FROM Account WHERE Id='" + req.params.id + "'";
      SF.queryAsync(query)
        .then(function(results) {
          var response = {
            success: true,
            affiliate: results.records[0]
          }

          res.json(response);
          return cache.addAsync(filename, response);
        })
        .then(function() {
          console.log("Cache updated!");
        })
        .catch(function(err) {
          res.json({
            success: false,
            error: err
          });
        });
    } else {
      res.json(cache[filename]);
    }
  })
  .post(function(req, res) {
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
  .delete(function(req, res) {
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

router.route('/web/:id')
  .get(function(req, res,next) {
    var filename = 'affiliates_info_' + req.params.id;
    var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
    if (cache.needsUpdated(filename, 30) || force_refresh) {
      var query = "SELECT Id, Name, Logo__c, Website, Page_Path__c, Summary__c, Industry_List__c, Locations__c, Languages__c, Public_Contact__c, Public_Contact_Phone__c, Public_Contact_Email__c FROM Account WHERE Id='" + req.params.id + "'";
      SF.queryAsync(query)
        .then(function(results) {
          var response = {
            success: true,
            affiliate: results.records[0]
          }

          res.json(response);
          return cache.addAsync(filename, response);
        })
        .then(function() {
          console.log("Cache updated!");
        })
        .catch(function(err) {
          res.json({
            success: false,
            error: err
          });
        });
    } else {
      res.json(cache[filename]);
    }
  })
  .post(function(req, res) {
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
  .delete(function(req, res) {
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

router.get('/next/:next_records', function(req, res) {
  var filename = 'affiliates_next_' + req.params.next_records;
  var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
  if (cache.needsUpdated(filename, 30) || force_refresh) {
    var query = req.params.next_records;
    SF.queryAsync(query)
      .then(function(results) {
        var response = {
          success: true,
          affiliates: results.records,
          done: results.done,
          next_records: results.nextRecordsUrl,
          total_size: results.totalSize
        }

        res.json(response);
        return cache.addAsync(filename, response);
      })
      .then(function() {
        console.log("Cache updated!");
      })
      .catch(function(err) {
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
