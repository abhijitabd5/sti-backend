// src/models/transaction-category.js

import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class TransactionCategory extends Model {
    static associate(models) {
      TransactionCategory.hasMany(models.Transaction, {
        foreignKey: "category_id",
        as: "transactions",
      });
    }
  }

  TransactionCategory.init(
    {
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      type: {
        type: DataTypes.ENUM("income", "expense"),
        allowNull: false,
      },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
      created_by: { type: DataTypes.INTEGER },
      updated_by: { type: DataTypes.JSON, defaultValue: [] },
      is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      deleted_by: { type: DataTypes.INTEGER },
    },
    {
      sequelize,
      modelName: "TransactionCategory",
      tableName: "transaction_categories",
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

  return TransactionCategory;
};