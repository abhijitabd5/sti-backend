// src/models/course.js

import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Course extends Model {
    static associate(models) {
      Course.hasMany(models.StudentEnrollment, {
        foreignKey: "course_id",
        as: "enrollments",
      });
      Course.hasMany(models.Certificate, {
        foreignKey: "course_id",
        as: "certificates",
      });
      Course.hasMany(models.StudentPayment, {
        foreignKey: "course_id",
        as: "payments",
      });
    }
  }

  Course.init(
    {
      course_group_id: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      language: {
        type: DataTypes.ENUM("en", "hi", "mar"),
        defaultValue: "en",
      },
      summary: { type: DataTypes.TEXT, allowNull: false },
      description: { type: DataTypes.TEXT("long"), allowNull: false },
      duration: { type: DataTypes.INTEGER, allowNull: false },
      syllabus_text: { type: DataTypes.TEXT, allowNull: true },
      syllabus_file_path: { type: DataTypes.STRING, allowNull: true },

      base_course_fee: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      is_discounted: { type: DataTypes.BOOLEAN, defaultValue: false },
      discount_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.0,
      },
      discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      discounted_course_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      hostel_available: { type: DataTypes.BOOLEAN, defaultValue: false },
      hostel_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
      mess_available: { type: DataTypes.BOOLEAN, defaultValue: false },
      mess_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
      total_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      show_offer_badge: { type: DataTypes.BOOLEAN, defaultValue: false },
      offer_badge_text: { type: DataTypes.STRING, allowNull: true },
      thumbnail: { type: DataTypes.STRING, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      display_order: { type: DataTypes.INTEGER, defaultValue: 0 },

      created_by: { type: DataTypes.INTEGER },
      updated_by: { type: DataTypes.JSON, defaultValue: [] },
      is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      deleted_by: { type: DataTypes.INTEGER },
    },
    {
      sequelize,
      modelName: "Course",
      tableName: "courses",
      timestamps: true,
      paranoid: true,
      hooks: {
        beforeCreate: (course, options) => {
          if (options.currentUserId) course.created_by = options.currentUserId;
        },
        beforeUpdate: (course, options) => {
          if (options.currentUserId) {
            const history = course.updated_by || [];
            history.push({
              id: options.currentUserId,
              timestamp: new Date().toISOString(),
            });
            course.updated_by = history;
          }
        },
        beforeDestroy: (course, options) => {
          if (options.currentUserId) {
            course.is_deleted = true;
            course.deleted_by = options.currentUserId;
          }
        },
      },
    }
  );

  return Course;
};
