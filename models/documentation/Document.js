'use strict';

module.exports = function(sequelize, DataTypes) {
    var Document = sequelize.define('Document', {
        title: DataTypes.STRING,
        short_description: DataTypes.STRING,
        content: DataTypes.TEXT
    }, {
        classMethods: {
            associate: function(models) {
                Document.belongsTo(models.Project, {
                    foreignKey: "ProjectId"
                });
                Document.hasMany(models.Method, {
                    as: "methods",
                    foreignKey: "DocumentId"
                });
                Document.belongsToMany(models.Tag, {
                    through: {
                        model: models.ItemTag,
                        unique: false,
                        scope: {
                            taggable: 'document'
                        }
                    },
                    foreignKey: 'taggable_id',
                    constraints: false
                });
            }
        }
    });

    return Document;
}
