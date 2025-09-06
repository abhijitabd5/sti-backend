// src/models/page-content.js

import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class PageContent extends Model {
    static associate(models) {
      PageContent.belongsTo(models.Page, { foreignKey: "page_id" });
    }
  }

  PageContent.init(
    {
      page_id: { type: DataTypes.INTEGER, allowNull: false },
      page_name: { type: DataTypes.STRING, allowNull: false },
      section_key: { type: DataTypes.STRING, allowNull: false },
      section_name: { type: DataTypes.STRING, allowNull: false },
      language: { type: DataTypes.ENUM("en", "hi", "mar"), allowNull: false },
      title: { type: DataTypes.STRING, allowNull: true },
      subtitle: { type: DataTypes.STRING, allowNull: true },
      content: { type: DataTypes.TEXT("long"), allowNull: false },
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.JSON,
      is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      deleted_by: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "PageContent",
      tableName: "page_contents",
      paranoid: true,
      timestamps: true,
      hooks: {
        beforeCreate: (pageContent, options) => {
          if (options.currentUserId) {
            pageContent.created_by = options.currentUserId;
          }
        },
        beforeUpdate: (pageContent, options) => {
          if (options.currentUserId) {
            const history = pageContent.updated_by || [];
            history.push({
              id: options.currentUserId,
              timestamp: new Date().toISOString(),
            });
            pageContent.updated_by = history;
          }
        },
        beforeDestroy: (pageContent,options) => {
          if (options.currentUserId) {
            pageContent.is_deleted = true;
            pageContent.deleted_by = options.currentUserId;
          }
        },
      },
    }
  );

  return PageContent;
};
