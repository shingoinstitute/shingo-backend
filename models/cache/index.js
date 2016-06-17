'use strict';

var fs = require("fs"),
  jsonfile = require("jsonfile"),
  path = require("path");

var cache = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = jsonfile.readFileSync(path.join(__dirname, file));
    cache[file.split('.')[0]] = model;
  });

cache.add = function(filename, obj, callback) {
  obj.timestamp = new Date();
  jsonfile.writeFile(path.join(__dirname, filename), obj, callback);
}

cache.needsUpdated = function(file, minutes) {
  var model = cache[file];
  if (!model[file]) return true;
  var timestamp = new Date(model.timestamp);
  return (timestamp - new Date()) > parseInt(minutes) * 60000;
}

module.exports = cache;
