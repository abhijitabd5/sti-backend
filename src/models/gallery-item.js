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
      is_media_remote: { type: DataTypes.BOOLEAN, defaultValue: false },
      media_path: { type: DataTypes.STRING, allowNull: true },
      is_thumbnail_remote: { type: DataTypes.BOOLEAN, defaultValue: false },
      thumbnail_path: { type: DataTypes.STRING, allowNull: true },
      display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
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
        beforeCreate: (record, options) => {
          if (options.currentUserId) record.created_by = options.currentUserId;
        },
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
