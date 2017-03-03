'use strict';

var router = require('express').Router(),
  q = require('../../../../models/query'),
  facilitators_route = require('./facilitators');

router.use('/facilitators', facilitators_route)

router.route('/')
.get(function(req, res, next) {
  var filename = 'affiliates';
  var query = "SELECT Id, Name, Logo__c, Page_Path__c, Website, App_Abstract__c, Languages__c FROM Account WHERE RecordType.Name='Licensed Affiliate' AND (NOT Name LIKE 'McKinsey%')";
  q.getQuery(filename, query, req.query.force_refresh, res)
})

router.route('/:id')
.get(function(req, res,next) {
  var filename = 'affiliates_' + req.params.id;
  var query = "SELECT Id, Name, Logo__c, Page_Path__c, Website, App_Abstract__c FROM Account WHERE Id='" + req.params.id + "'";
  q.getQuery(filename, query, req.query.force_refresh, res)
})
  
router.route('/web/:id')
.get(function(req, res,next) {
  var filename = 'affiliates_info_' + req.params.id;
  var query = "SELECT Id, Name, Logo__c, Website, Page_Path__c, Summary__c, Industry_List__c, Locations__c, Languages__c, Public_Contact__c, Public_Contact_Phone__c, Public_Contact_Email__c, Youtube_Path__c FROM Account WHERE Id='" + req.params.id + "'";
  q.getQuery(filename, query, req.query.force_refresh, res)
})

router.get('/next/:next_records', function(req, res) {
  var filename = 'affiliates_next_' + req.params.next_records;
  var query = req.params.next_records;
  q.getQuery(filename, query, req.query.force_refresh, res)  
});

module.exports = router;