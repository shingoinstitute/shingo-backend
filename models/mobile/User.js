'use strict';

var passwordHash = require('password-hash');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: DataTypes.STRING,
    biography: DataTypes.TEXT,
    picture: DataTypes.STRING,
    phone: DataTypes.STRING,
    website: DataTypes.STRING,
    lastLogin: DataTypes.DATE,
    optOut: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    classMethods: {
      associate: function(models) {
        User.belongsToMany(User, {
          as: 'children',
          through: models.Connection,
          foreignKey: 'ParentUserId'
        });
        User.belongsToMany(User, {
          as: 'parents',
          through: models.Connection,
          foreignKey: 'ChildUserId'
        });
        User.hasMany(models.Message, {
          as: 'sent',
          foreignKey: 'SenderId'
        });
        User.belongsToMany(models.Message, {
          as: 'messages',
          through: models.UserHasMessages,
          foreignKey: 'RecipientId'
        })
      }
    },
    instanceMethods: {
      verifyPassword: function(password){
        return passwordHash.verify(password, this.password)
      }
    }
  });

  return User;
}
