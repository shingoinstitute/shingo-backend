'use strict'

var router = require('express').Router(),
  q = require('../../../../models/query');

var file = 'publication_awards';

router.route('/')
.get(function(req, res, next){
  var filename = file;
  var query = "Select Name, Cover_Image__c, Order_Url__c, Published__c, Public_Author_Name__c, Embedded_Youtube_Url__c, Press_Release_Copy__c FROM Publication_Award__c WHERE Published__c=true";
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