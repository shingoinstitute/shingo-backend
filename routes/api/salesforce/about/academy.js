'use strict';

var router = require('express').Router(),
  q = require('../../../../models/query');

var basefile = 'academy';

router.route('/')
.get(function(req, res, next) {
  var filename = basefile;
  var query = "SELECT Id, Name, Title, Account.Name FROM Contact WHERE Shingo_Prize_Relationship__c INCLUDES('Shingo Academy') ORDER BY LastName";
  q.getQuery(filename, query, req.query.force_refresh, res)   
})

router.get('/next/:next_records', function(req, res) {
  var filename = basefile + '_next_' + req.params.next_records;
  var query = req.params.next_records;
  q.getQuery(filename, query, req.query.force_refresh, res)
})

module.exports = router;