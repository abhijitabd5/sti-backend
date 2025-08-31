// src/models/galleryvideo.js

import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class GalleryVideo extends Model {
    static associate(models) {}
  }

  GalleryVideo.init(
    {
      title: { type: DataTypes.STRING, allowNull: false },
      video_url: { type: DataTypes.STRING, allowNull: false },
      thumbnail: { type: DataTypes.STRING, allowNull: true },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
      created_by: { type: DataTypes.INTEGER, allowNull: false },
      updated_by: { type: DataTypes.JSON },
      is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      deleted_by: { type: DataTypes.INTEGER }
    },
    {
      sequelize,
      modelName: 'GalleryVideo',
      tableName: 'gallery_videos',
      paranoid: true,
      timestamps: true,
      hooks: {
        beforeUpdate: (record, options) => {
          if (!record.updated_by) record.updated_by = [];
          record.updated_by.push({ id: options?.userId, timestamp: new Date().toISOString() });
        },
        beforeDestroy: (record, options) => {
          record.is_deleted = true;
          record.deleted_by = options?.userId;
        }
      }
    }
  );

  return GalleryVideo;
};