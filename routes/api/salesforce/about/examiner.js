'use strict';

var router = require('express').Router(),
  q = require('../../../../models/query');

var basefile = 'examiners';
 
// Route for ALL examiners
router.route('/')
.get(function(req, res, next) {
  var filename = basefile;
  var query = "SELECT Id, Name, Title, Account.Name FROM Contact WHERE Shingo_Prize_Relationship__c INCLUDES('Research Examiner', 'Site Examiner', 'Publication Examiner') ORDER BY LastName";
  
})

// Route for only Site Examiners
router.route('/site')
.get(function(req, res, next) {
  var filename = basefile + "_site";
  var query = "SELECT Id, Name, Title, Account.Name FROM Contact WHERE Shingo_Prize_Relationship__c INCLUDES('Site Examiner') ORDER BY LastName";
  q.getQuery(filename, query, req.query.force_refresh, res)
})

// Route for only Research Examiners
router.route('/research')
.get(function(req, res, next) {
  var filename = basefile + "_research";  
  var query = "SELECT Id, Name, Title, Account.Name FROM Contact WHERE Shingo_Prize_Relationship__c INCLUDES('Research Examiner') ORDER BY LastName";
  q.getQuery(filename, query, req.query.force_refresh, res)    
})

// Route for only Publication Examiners
router.route('/publication')
.get(function(req, res, next) {
  var filename = basefile + "_publication";
  var query = "SELECT Id, Name, Title, Account.Name FROM Contact WHERE Shingo_Prize_Relationship__c INCLUDES('Publication Examiner') ORDER BY LastName";
  q.getQuery(filename, query, req.query.force_refresh, res)    
})

router.get('/next/:next_records', function(req, res) {
  var filename = basefile + '_next_' + req.params.next_records;
  var query = req.params.next_records;
  q.getQuery(filename, query, req.query.force_refresh, res)    
})

module.exports = router;