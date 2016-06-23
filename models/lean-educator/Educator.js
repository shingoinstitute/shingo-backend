'use strict';

module.exports = function(sequelize, DataTypes) {
  var Educator = sequelize.define('Educator', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    title: DataTypes.STRING,
    company: DataTypes.STRING,
    phone: DataTypes.STRING,
    secondary_phone: DataTypes.STRING,
    website: DataTypes.STRING,
    email: DataTypes.STRING,
    secondary_email: DataTypes.STRING,
    address_1: DataTypes.STRING,
    address_2: DataTypes.STRING,
    city: DataTypes.STRING,
    postal_code: DataTypes.STRING,
    country: DataTypes.STRING
  });

  return Educator;
}
