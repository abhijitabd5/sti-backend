// src/models/galleryphoto.js

import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class GalleryPhoto extends Model {
    static associate(models) {}
  }

  GalleryPhoto.init(
    {
      caption: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      image_path: { type: DataTypes.STRING, allowNull: false },
      display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_by: { type: DataTypes.INTEGER, allowNull: false },
      updated_by: { type: DataTypes.JSON, allowNull: true },
      is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      deleted_by: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      sequelize,
      modelName: "GalleryPhoto",
      tableName: "gallery_photos",
      paranoid: true,
      timestamps: true,
      hooks: {
        beforeUpdate: (record, options) => {
          if (!record.updated_by) record.updated_by = [];
          record.updated_by.push({
            id: options?.userId,
            timestamp: new Date().toISOString(),
          });
        },
        beforeDestroy: (record, options) => {
          record.is_deleted = true;
          record.deleted_by = options?.userId;
        },
      },
    }
  );

  return GalleryPhoto;
};
