"use strict";

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var config    = require("../config").mysql_connection
var sequelize = new Sequelize(config.support_database, config.support_user, config.support_password, {
  host: config.host,
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});
var db        = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
