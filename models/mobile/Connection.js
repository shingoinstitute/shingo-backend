'use strict';

module.exports = function(sequelize, DataTypes) {
  var Connection = sequelize.define('Connection', {
    status: {
      type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected'),
      defaultValue: "Pending"
    }
  });

  return Connection;
}
