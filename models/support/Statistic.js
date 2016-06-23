"use strict";

module.exports = function(sequelize, DataTypes){
  var Statistic = sequelize.define('Statistic', {
    content: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models){
        Statistic.hasMany(models.Ticket, {foreignKey: "TicketId"})
        Statistic.belongsTo(models.StatType, {foreignKey: "StatTypeId"})
      }
    }
  })

  return Statistic;
}
