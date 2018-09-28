'use strict'

var router = require('express').Router(),
  path = require('path'),
  q = require(path.join(appRoot, 'models/query'));

var file = 'research_awards';

router.route('/')
.get(function(req, res, next){
  var filename = file;
  var query = "Select Id, Name, Public_Author_Name__c, Press_Release_Date__c, Press_Release_Link__c FROM Research_Award__c WHERE Published__c=true ORDER BY Press_Release_Date__c DESC";
  var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
  q.getQuery(filename, query, force_refresh, res)
})

.patch(function(req, res) { q.notImplemented(req, res)})
.post(function(req, res) { q.notImplemented(req, res)})
.put(function(req, res) { q.notImplemented(req, res)})
.delete(function(req, res) { q.notImplemented(req, res)})

// Get overflow records for publication award
router.get('/next/:next_records', function(req, res){
  var filename = file + '_next_' + req.params.next_records;
  var query = req.params.next_records;
  var force_refresh = req.query.force_refresh ? req. force_refresh : false;
  q.getQuery(filename, query, force_refresh, res)
})

module.exports = router;
