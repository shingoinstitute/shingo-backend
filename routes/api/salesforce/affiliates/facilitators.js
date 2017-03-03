'use strict';

var router = require('express').Router(),
  q = require('../../../../models/query');

router.route('/:id')
.get(function(req, res, next) {
  var filename = 'facilitators_' + req.params.id;
  var query = "SELECT Id, Name, Title, Biography__c, Photograph__c, Account.Name FROM Contact WHERE Facilitator_For__r.Id='" + req.params.id + "' ORDER BY LastName";
  q.getQuery(filename, query, req.query.force_refresh, res)
})

router.get('/next/:next_records', function(req, res) {
  var filename = 'facilitators_next_' + req.params.next_records;
  var query = req.params.next_records;
  q.getQuery(filename, query, req.query.force_refresh, res)
})

module.exports = router;
