// src/models/transaction.js

import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Transaction extends Model {
    static associate(models) {
      Transaction.belongsTo(models.TransactionCategory, {
        foreignKey: "category_id",
        as: "category",
      });
      Transaction.belongsTo(models.Student, {
        foreignKey: "student_id",
        as: "student",
      });
      Transaction.belongsTo(models.Course, {
        foreignKey: "course_id",
        as: "course",
      });
      Transaction.belongsTo(models.StudentEnrollment, {
        foreignKey: "enrollment_id",
        as: "enrollment",
      });
      Transaction.belongsTo(models.User, {
        foreignKey: "created_by",
        as: "creator",
      });
      Transaction.belongsTo(models.User, {
        foreignKey: "expense_for_user",
        as: "expenseForUser",
      });
    }
  }

  Transaction.init(
    {
      type: {
        type: DataTypes.ENUM("income", "expense"),
        allowNull: false,
      },
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      transaction_date: { type: DataTypes.DATEONLY, allowNull: false },

      payment_mode: {
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
      description: { type: DataTypes.TEXT },

      // Payment identifiers
      payment_ref_num: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      payment_ref_type: {
        type: DataTypes.ENUM(
          "receipt",
          "transaction",
          "cheque",
          "invoice",
          "other"
        ),
        defaultValue: "other",
      },

      // Payer (for income)
      payer_name: { type: DataTypes.STRING },
      payer_contact: { type: DataTypes.STRING },
      payer_bank_name: { type: DataTypes.STRING },
      payer_account_number: { type: DataTypes.STRING },
      payer_upi_id: { type: DataTypes.STRING },

      // Payee (for expense)
      payee_name: { type: DataTypes.STRING },
      payee_contact: { type: DataTypes.STRING },
      payee_bank_name: { type: DataTypes.STRING },
      payee_account_number: { type: DataTypes.STRING },
      payee_upi_id: { type: DataTypes.STRING },

      // Attachments
      attachment_path: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      attachment_type: {
        type: DataTypes.ENUM("invoice", "receipt", "proof", "other"),
        allowNull: false,
        defaultValue: "other",
      },

      reference_note: { type: DataTypes.TEXT },

      // Audit
      created_by: { type: DataTypes.INTEGER },
      updated_by: { type: DataTypes.JSON, defaultValue: [] },
      is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      deleted_by: { type: DataTypes.INTEGER },
    },
    {
      sequelize,
      modelName: "Transaction",
      tableName: "transactions",
      timestamps: true,
      paranoid: true,
      hooks: {
        beforeCreate: (c, options) => {
          if (options.currentUserId) c.created_by = options.currentUserId;
        },
        beforeUpdate: (c, options) => {
          if (options.currentUserId) {
            const history = c.updated_by || [];
            history.push({
              id: options.currentUserId,
              timestamp: new Date().toISOString(),
            });
            c.updated_by = history;
          }
        },
        beforeDestroy: (c, options) => {
          if (options.currentUserId) {
            c.is_deleted = true;
            c.deleted_by = options.currentUserId;
          }
        },
      },
    }
  );

  return Transaction;
};
