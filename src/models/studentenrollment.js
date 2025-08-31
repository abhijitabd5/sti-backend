// src/models/studentenrollment.js

import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class StudentEnrollment extends Model {
    static associate(models) {
      StudentEnrollment.belongsTo(models.Student, {
        foreignKey: "student_id",
        as: "student",
      });
      StudentEnrollment.belongsTo(models.Course, {
        foreignKey: "course_id",
        as: "course",
      });
    }
  }

  StudentEnrollment.init(
    {
      student_id: { type: DataTypes.INTEGER, allowNull: false },
      course_id: { type: DataTypes.INTEGER, allowNull: false },
      status: {
        type: DataTypes.ENUM("not_started", "ongoing", "completed", "aborted"),
        defaultValue: "not_started",
      },
      enrollment_date: { type: DataTypes.DATEONLY, allowNull: false },
      completion_date: { type: DataTypes.DATEONLY },
      base_course_fee: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      course_discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      course_discount_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      is_hostel_opted: { type: DataTypes.BOOLEAN, defaultValue: false },
      is_mess_opted: { type: DataTypes.BOOLEAN, defaultValue: false },
      hostel_fee: { type: DataTypes.DECIMAL(10, 2) },
      mess_fee: { type: DataTypes.DECIMAL(10, 2) },
      accommodation_discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      accommodation_discount_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      accommodation_total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      pre_tax_total_fee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: "Discounted course fee inclusive of accommodation",
      },
      taxable_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment:
          "Discounted course fee exclusive of non-taxable accommodation fees",
      },
      sgst_percentage: { type: DataTypes.DECIMAL(5, 2) },
      cgst_percentage: { type: DataTypes.DECIMAL(5, 2) },
      sgst_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      cgst_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      total_payable_fee: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      paid_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      due_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      remark: { type: DataTypes.TEXT },
      created_by: { type: DataTypes.INTEGER },
      updated_by: { type: DataTypes.JSON, defaultValue: [] },
      is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      deleted_by: { type: DataTypes.INTEGER },
    },
    {
      sequelize,
      modelName: "StudentEnrollment",
      tableName: "student_enrollments",
      timestamps: true,
      paranoid: true,
      hooks: {
        beforeCreate: (record, options) => {
          if (options.currentUserId) record.created_by = options.currentUserId;
        },
        beforeUpdate: (record, options) => {
          if (options.currentUserId) {
            const history = record.updated_by || [];
            history.push({
              id: options.currentUserId,
              timestamp: new Date().toISOString(),
            });
            record.updated_by = history;
          }
        },
        beforeDestroy: (record, options) => {
          if (options.currentUserId) {
            record.is_deleted = true;
            record.deleted_by = options.currentUserId;
          }
        },
      },
    }
  );

  return StudentEnrollment;
};
