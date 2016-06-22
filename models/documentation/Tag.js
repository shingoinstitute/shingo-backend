'use strict';

module.exports = function(sequelize, DataTypes) {
    var Tag = sequelize.define('Tag', {
        name: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                Tag.belongsToMany(models.Project, {
                    through: {
                        model: models.ItemTag,
                        unique: false
                    },
                    foreignKey: 'tag_id'
                });
                Tag.belongsToMany(models.Document, {
                    through: {
                        model: models.ItemTag,
                        unique: false
                    },
                    foreignKey: 'tag_id'
                });
                Tag.belongsToMany(models.Method, {
                    through: {
                        model: models.ItemTag,
                        unique: false
                    },
                    foreignKey: 'tag_id'
                });
            }
        }
    });

    return Tag;
}
