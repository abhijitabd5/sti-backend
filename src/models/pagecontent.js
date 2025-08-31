// src/models/pagecontent.js

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
      section_key: { type: DataTypes.STRING, allowNull: false },
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
    }
  );

  return PageContent;
};
