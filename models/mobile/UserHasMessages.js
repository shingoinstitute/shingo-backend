'use strict';

module.exports = function(sequelize, DataTypes) {
  var UserHasMessages = sequelize.define('UserHasMessages', {
    status: {
      type: DataTypes.ENUM('Unread', 'Read', 'Deleted'),
      defaultValue: "Unread"
    }
  });

  return UserHasMessages;
}
