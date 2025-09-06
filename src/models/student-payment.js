// src/models/student-payment.js

import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class StudentPayment extends Model {
    static associate(models) {
      StudentPayment.belongsTo(models.Student, {
        foreignKey: "student_id",
        as: "student",
      });
      StudentPayment.belongsTo(models.Course, {
        foreignKey: "course_id",
        as: "course",
      });
      StudentPayment.belongsTo(models.StudentEnrollment, {
        foreignKey: "enrollment_id",
        as: "enrollment",
      });
    }
  }

  StudentPayment.init(
    {
      student_id: { type: DataTypes.INTEGER, allowNull: false },
      course_id: { type: DataTypes.INTEGER, allowNull: false },
      enrollment_id: { type: DataTypes.INTEGER, allowNull: false },

      type: {
        type: DataTypes.ENUM(
          "course_fee",
          "accommodation_fee",
          "penalty",
          "miscellaneous"
        ),
        allowNull: false,
        defaultValue: "course_fee",
      },

      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

      payment_date: { type: DataTypes.DATEONLY, allowNull: false },
      payment_method: {
        type: DataTypes.ENUM(
          "cash",
          "cheque",
          "upi",
          "bank_transfer",
          "card",
          "net_banking",
          "payment_gateway"
        ),
        allowNull: false,
      },

      previous_due_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: "Due amount before applying this payment",
      },
      remaining_due_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: "Due amount after applying this payment",
      },

      created_by: { type: DataTypes.INTEGER },
      updated_by: { type: DataTypes.JSON, defaultValue: [] },
      is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      deleted_by: { type: DataTypes.INTEGER },
    },
    {
      sequelize,
      modelName: "StudentPayment",
      tableName: "student_payments",
      timestamps: true,
      paranoid: true,
      hooks: {
        beforeCreate: (payment, options) => {
          if (options.currentUserId)
            payment.created_by = options.currentUserId;
        },
        beforeUpdate: (payment, options) => {
          if (options.currentUserId) {
            const history = payment.updated_by || [];
            history.push({
              id: options.currentUserId,
              timestamp: new Date().toISOString(),
            });
            payment.updated_by = history;
          }
        },
        beforeDestroy: (payment, options) => {
          if (options.currentUserId) {
            payment.is_deleted = true;
            payment.deleted_by = options.currentUserId;
          }
        },
      },
    }
  );

  return StudentPayment;
};