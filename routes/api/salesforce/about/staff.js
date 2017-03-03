'use strict';

var router = require('express').Router(),
  q = require('../../../../models/query');

router.route('/')
.get(function(req, res, next) {
  var filename = 'staff';
  var query = "SELECT Name, Title, Email, Phone, Photograph__c  FROM Contact WHERE AccountId=\'0011200001Gkm2uAAB\' ORDER BY LastName";
  q.getQuery(filename, query, req.query.force_refresh, res)
})

router.get('/next/:next_records', function(req, res) {
  var filename = 'staff_next_' + req.params.next_records;
  var query = req.params.next_records;
  q.getQuery(filename, query, req.query.force_refresh, res)  
})

module.exports = router;
