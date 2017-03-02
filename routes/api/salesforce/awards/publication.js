'use strict'

var router = require('express').Router(),
  Promise = require('bluebird'),
  SF = Promise.promisifyAll(require('../../../../models/sf')),
  cache = Promise.promisifyAll(require('../../../../models/cache')),
  query = Promise.promisifyAll(require('./get'));

// Default Get Route
// Abstract into single function?
router.route('/')
.get(function(req, res, next){
  var filename = 'publication_awards';
  var query = "Select Name, Cover_Image__c, Order_Url__c, Published__c, Public_Author_Name__c, Embedded_Youtube_Url__c, Press_Release_Copy__c FROM Publication_Award__c WHERE Published__c=true";
  var force_refresh = req.query.force_refresh ? req.query.force_refresh : true;
  query.getQueryAsync(filename, query, force_refresh)
  .then(function(response){
    console.log("Get Function: ", response)
    res.json(response);
  })
})

// Get overflow records
router.get('/next/:next_records', function(req, res){
  var filename = file + '_next_' + req.params.next_records;
  // TODO Put in if statement?
  var force_refresh = req.query.force_refresh ? req. force_refresh : false;
  if(cache.needsUpdated(filename, 30) || force_refresh){
    var query = req.params.next_records;
    SF.queryAsync(query)
    .then(function(results){
      var response = {
        success: true,
        records: results.records,
        done: results.done,
        next_records: results.nextRecordsUrl,
        total_size: results.totalSize
      }

      res.json(response);
      return cache.addAsync(filename, response)
    })
    .then(function(){
      console.log("Cache Updated! Filename: ", filename)
    })
    .catch(function(err){
      res.json({
        success: false,
        error: err
      })
    })
  }
  else {
    res.json(cache[filename]);
  }
})

module.exports = router;