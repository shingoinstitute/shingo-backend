'use strict'

var router = require('express').Router(),
  q = require('../../../../models/query');

var basefile = 'publication_awards';

router.route('/')
.get(function(req, res, next){
  var filename = basefile;
  var query = "Select Name, Cover_Image__c, Order_Url__c, Published__c, Public_Author_Name__c, Embedded_Youtube_Url__c, Press_Release_Copy__c FROM Publication_Award__c WHERE Published__c=true";
  q.getQuery(filename, query, req.query.force_refresh, res)
})

.patch(function(req, res) { q.notImplemented(req, res)})
.post(function(req, res) { q.notImplemented(req, res)})
.put(function(req, res) { q.notImplemented(req, res)})
.delete(function(req, res) { q.notImplemented(req, res)})

// Get overflow records for publication award
router.get('/next/:next_records', function(req, res){
  var filename = basefile + '_next_' + req.params.next_records;
  var query = req.params.next_records;
  q.getQuery(filename, query, req.query.force_refresh, res)
})

module.exports = router;