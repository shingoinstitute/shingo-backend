'use strict';

var fs = require("fs"),
  path = require("path"),
  Sequelize = require("sequelize"),
  config = require("../../config").mysql_connection;

var sequelize = new Sequelize(config.lean_database, config.lean_user, config.lean_password, {
  host: config.host,
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});
var db = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .filter(function(file) {
    return fs.statSync(path.join(__dirname, file)).isFile();
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
