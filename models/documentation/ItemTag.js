'use strict';

module.exports = function(sequelize, DataTypes) {
    var ItemTag = sequelize.define('ItemTag', {
        tag_id: {
            type: DataTypes.INTEGER,
            unique: 'item_tag_taggable'
        },
        taggable: {
            type: DataTypes.STRING,
            unique: 'item_tag_taggable'
        },
        taggable_id: {
            type: DataTypes.INTEGER,
            unique: 'item_tag_taggable',
            references: null
        }
    });

    return ItemTag;
}
