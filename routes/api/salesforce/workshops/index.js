'use strict';

var router = require('express').Router(),
  q = require('../../../../models/query');

router.route('/')
.get(function(req, res, next) {
  var filename = 'workshops';
  var query = "SELECT Id, Name, Host_Site__c, Start_Date__c, End_Date__c, Event_City__c, Event_Country__c, Organizing_Affiliate__r.Name, Organizing_Affiliate__r.Id, Workshop_Type__c, Registration_Website__c FROM Workshop__c WHERE Public__c=true AND Status__c='Verified'";
  q.getQuery(filename, query, req.query.force_refresh, res)
})

router.get('/next/:next_records', function(req, res) {
  var filename = 'workshops_next_' + req.params.next_records;
  var query = req.params.next_records;
  q.getQuery(filename, query, req.query.force_refresh, res)
})

module.exports = router;