"use strict";

module.exports = function(sequelize, DataTypes){
  var Comment = sequelize.define('Comment', {
    content: DataTypes.TEXT,
    type: {type:DataTypes.ENUM('User', 'System'), allowNull: false}
  }, {
    classMethods: {
      associate: function(models){
        Comment.belongsTo(models.Ticket, {foreignKey: "TicketId"})
        Comment.belongsTo(models.User, {foreignKey: "UserId"})
      }
    }
  })

  return Comment;
}
