"use strict";

module.exports = function(sequelize, DataTypes){
  var Category = sequelize.define('Category', {
    name: DataTypes.STRING,
    description: DataTypes.TEXT
  },{
     classMethods:{
       associate: function(models){
         Category.hasMany(models.Ticket, {foreignKey: "CategoryId"})
       }
     }
  })

  return Category;
}
