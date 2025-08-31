// src/models/studentreview.js

import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class StudentReview extends Model {
    static associate(models) {
      StudentReview.belongsTo(models.Student, { foreignKey: 'student_id' });
    }
  }

  StudentReview.init(
    {
      student_id: { type: DataTypes.INTEGER, allowNull: true },
      phone: { type: DataTypes.STRING, allowNull: true },
      review_text: { type: DataTypes.TEXT, allowNull: false },
      rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
      is_approved: { type: DataTypes.BOOLEAN, defaultValue: false },
      display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
      qr_code_url: { type: DataTypes.STRING, allowNull: false },
      created_by: { type: DataTypes.INTEGER, allowNull: false },
      updated_by: { type: DataTypes.JSON },
      is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      deleted_by: { type: DataTypes.INTEGER }
    },
    {
      sequelize,
      modelName: 'StudentReview',
      tableName: 'student_reviews',
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

  return StudentReview;
};