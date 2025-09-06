// src/models/gallery-item.js

import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class GalleryItem extends Model {
    static associate(models) {}
  }

  GalleryItem.init(
    {
      media_type: { type: DataTypes.ENUM("photo", "video"), allowNull: false },
      caption: { type: DataTypes.STRING, allowNull: true },
      title: { type: DataTypes.STRING, allowNull: true },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      is_image_remote: { type: DataTypes.BOOLEAN, defaultValue: false },
      is_video_remote: { type: DataTypes.BOOLEAN, defaultValue: false },
      image_path: { type: DataTypes.STRING, allowNull: true }, // photo or thumbnail
      video_url: { type: DataTypes.STRING, allowNull: true }, // video only
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
      modelName: "GalleryItem",
      tableName: "gallery_items",
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

  return GalleryItem;
};
