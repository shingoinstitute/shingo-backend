"use strict";

module.exports = function(sequelize, DataTypes){
  var Ticket = sequelize.define('Ticket', {
    description: DataTypes.TEXT,
    closedAt: DataTypes.DATE,
    responseTime: DataTypes.FLOAT,
    reopened: {type:DataTypes.INTEGER, defaultValue: 0},
    guestEmail: DataTypes.STRING
  }, {
    classMethods:{
      associate: function(models){
        Ticket.belongsTo(models.User, {as: "Owner", foreignKey: "UserId"})
        Ticket.belongsTo(models.User, {as: "Assignee", foreignKey: "AssignedId"})
        Ticket.belongsTo(models.Category, {foreignKey: "CategoryId"})
        Ticket.belongsTo(models.Priority, {foreignKey: "PriorityId"})
        Ticket.belongsTo(models.Status, {foreignKey: "StatusId"})
        Ticket.hasMany(models.Comment, {as: "comments", foreignKey: "TicketId"})
      }
    }
  })

  return Ticket;
}
