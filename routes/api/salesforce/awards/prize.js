'use strict'

var router = require('express').Router(),
  path = require('path'),
  q = require(path.join(appRoot, 'models/query'));

var file = 'prize_awards';

router.route('/')
.get(function(req, res, next){
  var filename = file;
  var query = "Select Name, Date_Awarded__c, City__c, State__c, Country__c, SV_Status__c, Company_Profile_Link__c, Press_Release_Link__c FROM Assessment__c WHERE Publish_to_Website__c=true and Publish_Time_Requirement_Fulfilled__c=false ORDER BY Date_Awarded__c DESC";
  var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
  q.getQuery(filename, query, force_refresh, res)
})

.patch(function(req, res) { q.notImplemented(req, res)})
.post(function(req, res) { q.notImplemented(req, res)})
.put(function(req, res) { q.notImplemented(req, res)})
.delete(function(req, res) { q.notImplemented(req, res)})

router.get('/next/:next_records', function(req, res){
    var filename = file + '_next_' + req.params.next_records;
    var query = req.params.next_records;
    var force_refresh = req.query.force_refresh ? req. force_refresh : false;
    q.getQuery(filename, query, force_refresh, res)
})

module.exports = router;
