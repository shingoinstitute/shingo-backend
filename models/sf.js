var jsforce = require('jsforce'),
  path = require('path'),
  config = require(path.join(appRoot, 'config.js'))

var conn = new jsforce.Connection({loginUrl: config.sf.environment});

exports.query = function(query, callback) {
  conn.login(config.sf.username, config.sf.password, function(err, res) {
    if (err) {
      callback(err, null);
    } else {
      conn.query(query, function(err, res) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, res);
        }
      });
    }
  });
}
