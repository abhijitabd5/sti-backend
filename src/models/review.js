// src/models/review.js

import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class StudentReview extends Model {
    static associate(models) {
      StudentReview.belongsTo(models.Student, { foreignKey: "student_id" });
    }
  }

  StudentReview.init(
    {
      student_id: { type: DataTypes.INTEGER, allowNull: true },
      phone: { type: DataTypes.STRING, allowNull: true },
      review_text: { type: DataTypes.TEXT, allowNull: false },
      rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
      is_approved: { type: DataTypes.BOOLEAN, defaultValue: false },
      is_enrolled_student: { type: DataTypes.BOOLEAN, defaultValue: false },
      display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
      qr_code_url: { type: DataTypes.STRING, allowNull: false },
      created_by: { type: DataTypes.INTEGER, allowNull: false },
      updated_by: { type: DataTypes.JSON },
      is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      deleted_by: { type: DataTypes.INTEGER },
    },
    {
      sequelize,
      modelName: "Review",
      tableName: "reviews",
      paranoid: true,
      timestamps: true,
      hooks: {
        beforeCreate: (instance, options) => {
          if (options?.currentUserId) {
            instance.created_by = options.currentUserId;
          }
        },
        beforeUpdate: (instance, options) => {
          if (options.currentUserId) {
            const history = instance.updated_by || [];
            history.push({
              id: options?.currentUserId,
              timestamp: new Date().toISOString(),
            });
            instance.updated_by = history;
          }
        },
        beforeDestroy: (instance, options) => {
          if (options.currentUserId) {
            instance.is_deleted = true;
            instance.deleted_by = options.currentUserId;
          }
        },
      },
    }
  );

  return StudentReview;
};
