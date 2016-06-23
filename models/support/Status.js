"use strict";

module.exports = function(sequelize, DataTypes){
  var Status = sequelize.define('Status', {
    name: DataTypes.STRING,
    order: {type: DataTypes.INTEGER, defaultValue: 0}
  }, {
    classMethods: {
      associate: function(models){
        Status.hasMany(models.Ticket, {foreignKey: "StatusId"})
      }
    }
  })

  return Status;
}
