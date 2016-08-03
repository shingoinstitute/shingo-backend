"use strict";

module.exports = function(sequelize, DataTypes){
  var Feedback = sequelize.define('Feedback', {
    description: DataTypes.TEXT,
    email: DataTypes.STRING,
    device: DataTypes.STRING,
    details: DataTypes.TEXT,
    rating: DataTypes.INTEGER
  })

  return Feedback;
}
