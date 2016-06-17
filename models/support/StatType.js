"use strict";

module.exports = function(sequelize, DataTypes){
  var StatType = sequelize.define('StatType', {
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models){
        StatType.hasMany(models.Statistic, {foreignKey: "StatTypeId"})
      }
    }
  })

  return StatType;
}
