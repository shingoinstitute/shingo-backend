"use strict";

module.exports = function(sequelize, DataTypes){
  var Priority = sequelize.define('Priority', {
    name: DataTypes.STRING,
    value: {type: DataTypes.INTEGER, defaultValue: 0}
  }, {
    classMethods: {
      associate: function(models){
        Priority.hasMany(models.Ticket, {foreignKey: "PriorityId"})
      }
    }
  })

  return Priority;
}
