// src/models/student-enrollment.js

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
        type: DataTypes.ENUM(
          "not_started",
          "ongoing",
          "completed",
          "aborted",
          "expelled"
        ),
        defaultValue: "not_started",
      },

      enrollment_date: { type: DataTypes.DATEONLY, allowNull: false },
      completion_date: { type: DataTypes.DATEONLY },

      // ---- Course Fee Snapshot ----
      base_course_fee: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      course_discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      course_discount_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      discounted_course_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      // ---- Accommodation (non-taxable) ----
      is_hostel_opted: { type: DataTypes.BOOLEAN, defaultValue: false },
      hostel_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },

      is_mess_opted: { type: DataTypes.BOOLEAN, defaultValue: false },
      mess_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },

      // ---- Totals ----
      pre_tax_total_fee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: "discounted_course_fee + hostel_fee + mess_fee",
      },

      // ---- Discounts ----
      extra_discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: "Exceptional discount applied before tax",
      },

      // ---- Taxation ----
      taxable_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment:
          "discounted_course_fee - extra_discount_amount (hostel/mess excluded)",
      },
      sgst_percentage: { type: DataTypes.DECIMAL(5, 2) },
      cgst_percentage: { type: DataTypes.DECIMAL(5, 2) },
      sgst_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      cgst_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      igst_applicable: { type: DataTypes.BOOLEAN, defaultValue: false },
      igst_percentage: { type: DataTypes.DECIMAL(5, 2) },
      igst_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      total_tax_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },

      // ---- Final Payable ----
      total_payable_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: "taxable_amount + total_tax_amount + hostel_fee + mess_fee",
      },
      paid_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      due_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

      remark: { type: DataTypes.TEXT },

      // ---- Audit Fields ----
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      updated_by: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deleted_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
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
