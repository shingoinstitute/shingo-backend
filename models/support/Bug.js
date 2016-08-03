"use strict";

module.exports = function(sequelize, DataTypes){
  var Bug = sequelize.define('Bug', {
    description: DataTypes.TEXT,
    email: DataTypes.STRING,
    device: DataTypes.STRING,
    details: DataTypes.TEXT
  })

  return Bug;
}
