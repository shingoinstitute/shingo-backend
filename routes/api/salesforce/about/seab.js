'use strict';

var router = require('express').Router(),
  q = require('../../../../models/query');

router.route('/')
  .get(function(req, res, next) {
    var filename = 'exec_board';
    var query = "SELECT Id, Name, Title, Account.Name, Photograph__c, Biography__c FROM Contact WHERE Shingo_Prize_Relationship__c INCLUDES('Board of Governors') ORDER BY LastName";
    q.getQuery(filename, query, req.query.force_refresh, res)
  })

router.get('/next/:next_records', function(req, res) {
  var filename = 'exec_board_next_' + req.params.next_records;
  var query = req.params.next_records;
  q.getQuery(filename, query, req.query.force_refresh, res)
})

module.exports = router;