// src/models/page.js

import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Page extends Model {
    static associate(models) {
      Page.hasMany(models.PageContent, { foreignKey: "page_id" });
    }
  }

  Page.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, unique: true, allowNull: false },
      language: { type: DataTypes.ENUM("en", "hi", "mar"), allowNull: false },
      page_title: { type: DataTypes.STRING },
      meta_title: { type: DataTypes.STRING },
      meta_description: { type: DataTypes.STRING },
      meta_keywords: { type: DataTypes.STRING },
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.JSON,
      is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      deleted_by: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Page",
      tableName: "pages",
      paranoid: true,
      timestamps: true,
    }
  );

  return Page;
};
