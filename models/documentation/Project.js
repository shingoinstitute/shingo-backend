'use strict';

module.exports = function(sequelize, DataTypes){
  var Project = sequelize.define('Project', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    git_repository: DataTypes.STRING
  }, {
    classMethods:{
      associate: function(models){
        Project.hasMany(models.Document, {as: 'documents', foreignKey: "ProjectId"});
        Project.hasMany(Project, {as: 'sub_projects', foreignKey: "ParentId"});
        Project.belongsTo(Project, {as: 'parent_project', foreignKey: "ParentId"});
        Project.belongsToMany(models.Tag, {
            through: {
                model: models.ItemTag,
                unique: false,
                scope: {
                    taggable: 'project'
                }
            },
            foreignKey: 'taggable_id',
            constraints: false
        });
      }
    }
  });

  return Project;
}
