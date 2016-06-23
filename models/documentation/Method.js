'use strict';

module.exports = function(sequelize, DataTypes){
  var Method = sequelize.define('Method', {
    name: DataTypes.STRING,
    signature: DataTypes.STRING,
    parameters: DataTypes.STRING,
    return_value: DataTypes.STRING,
    short_description: DataTypes.STRING,
    deprecated: DataTypes.BOOLEAN,
    content: DataTypes.TEXT
  }, {
    classMethods:{
      associate: function(models){
        Method.belongsTo(models.Document, {foreignKey: "DocumentId"});
        Method.belongsToMany(models.Tag, {
            through: {
                model: models.ItemTag,
                unique: false,
                scope: {
                    taggable: 'method'
                }
            },
            foreignKey: 'taggable_id',
            constraints: false
        });
      }
    }
  });

  return Method;
}
