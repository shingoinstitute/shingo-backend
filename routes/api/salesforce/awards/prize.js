'use strict'

var router = require('express').Router(),
  path = require('path'),
  q = require(path.join(appRoot, 'models/query'));

var file = 'prize_awards';

router.route('/')
.get(function(req, res, next){
  var filename = file;
  var query = "Select Id, Name, Date_Awarded__c, City__c, State__c, Country__c, SV_Status__c FROM Assessment__c WHERE Publish_to_Website__c=true ORDER BY Date_Awarded__c DESC";
  //, Name, Date_Awarded__c, City__c, State__c, Country__c, SV_Status__c
  //var query = "Select Id, Name, Public_Author_Name__c, Press_Release_Date__c FROM Publication_Award__c WHERE Published__c=true ORDER BY Press_Release_Date__c DESC";
  var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
  q.getQuery(filename, query, force_refresh, res)
})

.patch(function(req, res) { q.notImplemented(req, res)})
.post(function(req, res) { q.notImplemented(req, res)})
.put(function(req, res) { q.notImplemented(req, res)})
.delete(function(req, res) { q.notImplemented(req, res)})

router.route('/:id')
.get(function(req, res, next){
  var filename = file + "_" + req.params.id;
  var query = "Select Name, Company_Profile__c, Press_Release_Link__c, Link_to_Logo__c FROM Assessment__c WHERE Publish_to_Website__c=true AND Id='" + req.params.id + "'";
  var force_refresh = req.query.force_refresh ? req.query.force_refresh : false;
  q.getQuery(filename, query, force_refresh, res)
})

router.get('/next/:next_records', function(req, res){
    var filename = file + '_next_' + req.params.next_records;
    var query = req.params.next_records;
    var force_refresh = req.query.force_refresh ? req. force_refresh : false;
    q.getQuery(filename, query, force_refresh, res)
})

module.exports = router;
