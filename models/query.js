'use strict';

var Promise = require('bluebird'),
  SF = Promise.promisifyAll(require('./sf')),
  cache = Promise.promisifyAll(require('./cache'));

var q = {}

q.getQuery = function(filename, query, force_refresh, res){
  if(cache.needsUpdated(filename, 30) || force_refresh || process.env.NODE_ENV != "production") {
    var query = query;
    SF.queryAsync(query)
      .then(function(results){
        var response = {
          success: true,
          records: results.records,
          total_size: results.totalSize,
          done: results.done,
          next_records: results.nextRecordsUrl
        }
        res.json(response)
        return cache.addAsync(filename, response);
      })
      .then(function(){
        console.log("Cache Updated! Filename:", filename);
      })
      .catch(function(err){
        const response = {
          success: false,
          error: err
        }
        res.json(response)        
      })
  }
  else {
    res.json(cache[filename]);
  }
}

q.notImplemented = function(req, res){
   if (!req.session.access_token) {
    return res.json({
      success: false,
      error: "Not authorized!"
    });
  }

  res.json({
    success: false,
    error: "Not implemented!"
  });
}

module.exports = q