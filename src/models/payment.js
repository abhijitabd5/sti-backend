// src/models/payment.js

import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Student, {
        foreignKey: "student_id",
        as: "student",
      });
      Payment.belongsTo(models.Course, {
        foreignKey: "course_id",
        as: "course",
      });
    }
  }

  Payment.init(
    {
      student_id: { type: DataTypes.INTEGER, allowNull: false },
      course_id: { type: DataTypes.INTEGER, allowNull: true },
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      discount_amount: { type: DataTypes.DECIMAL(10, 2) },
      net_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      payment_date: { type: DataTypes.DATEONLY, allowNull: false },
      payment_method: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      receipt_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      created_by: { type: DataTypes.INTEGER },
      updated_by: { type: DataTypes.JSON, defaultValue: [] },
      is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      deleted_by: { type: DataTypes.INTEGER },
    },
    {
      sequelize,
      modelName: "Payment",
      tableName: "payments",
      timestamps: true,
      paranoid: true,
      hooks: {
        beforeCreate: (p, options) => {
          if (options.currentUserId) p.created_by = options.currentUserId;
        },
        beforeUpdate: (p, options) => {
          if (options.currentUserId) {
            const history = p.updated_by || [];
            history.push({
              id: options.currentUserId,
              timestamp: new Date().toISOString(),
            });
            p.updated_by = history;
          }
        },
        beforeDestroy: (p, options) => {
          if (options.currentUserId) {
            p.is_deleted = true;
            p.deleted_by = options.currentUserId;
          }
        },
      },
    }
  );

  return Payment;
};
