// src/models/user.js

import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Student, { foreignKey: "user_id", as: "student" });
      User.hasMany(models.Transaction, { foreignKey: "created_by", as: "creator" });
      User.hasMany(models.Transaction, { foreignKey: "expense_for_user", as: "expenseForUser" });
    }
  }

  User.init(
    {
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Hashed with bcrypt",
      },
      role: {
        type: DataTypes.ENUM(
          "super_admin",
          "admin",
          "account",
          "seo",
          "employee",
          "trainer",
          "warden",
          "student",
          "marketing"
        ),
        defaultValue: "student",
      },
      profile_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      last_login_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      updated_by: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: "Array of {id, timestamp}",
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
      modelName: "User",
      tableName: "users",
      timestamps: true,
      paranoid: true,
      hooks: {
        beforeCreate: (user, options) => {
          if (options.currentUserId) {
            user.created_by = options.currentUserId;
          }
        },
        beforeUpdate: (user, options) => {
          if (options.currentUserId) {
            const history = user.updated_by || [];
            history.push({
              id: options.currentUserId,
              timestamp: new Date().toISOString(),
            });
            user.updated_by = history;
          }
        },
        beforeDestroy: (user, options) => {
          if (options.currentUserId) {
            user.is_deleted = true;
            user.deleted_by = options.currentUserId;
          }
        },
      },
    }
  );

  return User;
};
