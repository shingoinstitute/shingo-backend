"use strict";

module.exports = function(sequelize, DataTypes){
  var User = sequelize.define('User', {
    email: {type:DataTypes.STRING, unique: true},
    name: DataTypes.STRING
  }, {
    classMethods:{
      associate: function(models){
        User.belongsTo(models.Role, {foreignKey: "RoleId"})
        User.hasMany(models.Ticket, {as: 'tickets', foreignKey: "UserId"})
        User.hasMany(models.Ticket, {as: 'assigned', foreignKey: "AssignedId"})
        User.hasMany(models.Comment, {as: 'comments', foreignKey: "UserId"})
      }
    }
  })

  return User;
}
