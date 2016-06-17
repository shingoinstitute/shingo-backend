'use strict';

module.exports = function(sequelize, DataTypes) {
  var Message = sequelize.define('Message', {
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function(models) {
        Message.belongsTo(models.User, {
          as: 'sender',
          foreignKey: 'SenderId'
        });
        Message.belongsToMany(models.User, {
          as: 'recipients',
          through: models.UserHasMessages,
          foreignKey: 'MessageId'
        });
      }
    }
  });

  return Message;
}
