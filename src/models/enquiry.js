// src/models/enquiry.js

import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Enquiry extends Model {
    static associate(models) {
      Enquiry.belongsTo(models.Course, {
        foreignKey: "course_id",
        as: "course",
      });
    }
  }

  Enquiry.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: true },
      phone: { type: DataTypes.STRING, allowNull: false },

      course_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "courses", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      message: { type: DataTypes.TEXT, allowNull: false },
      status: {
        type: DataTypes.ENUM("unread", "read", "action_taken"),
        defaultValue: "unread",
      },
      is_action_taken: { type: DataTypes.BOOLEAN, defaultValue: false },
      action_type: {
        type: DataTypes.ENUM(
          "call",
          "whatsapp",
          "email",
          "text_message",
          "visit"
        ),
        allowNull: true,
      },
      remark: { type: DataTypes.TEXT, allowNull: true },
      created_by: DataTypes.INTEGER,
      updated_by: { type: DataTypes.JSON, defaultValue: [] },
      is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      deleted_by: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Enquiry",
      tableName: "enquiries",
      paranoid: true,
      timestamps: true,
    }
  );

  return Enquiry;
};
