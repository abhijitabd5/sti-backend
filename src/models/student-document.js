// src/models/student-document.js

import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class StudentDocument extends Model {
    static associate(models) {
      StudentDocument.belongsTo(models.Student, {
        foreignKey: "student_id",
        as: "student",
      });
    }
  }

  StudentDocument.init(
    {
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      slug: {
        type: DataTypes.ENUM(
          "aadhaar",
          "pan",
          "ssc",
          "hsc",
          "diploma",
          "graduation",
          "post_grad",
          "school_leaving",
          "birth_certificate",
          "caste_certificate",
          "income_certificate",
          "disability_certificate",
          "photo",
          "signature"
        ),
        allowNull: false,
      },
      file_path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      file_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      uploaded_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
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
      modelName: "StudentDocument",
      tableName: "student_documents",
      timestamps: true,
      paranoid: true,
      hooks: {
        beforeCreate: (doc, options) => {
          if (options.currentUserId) {
            doc.created_by = options.currentUserId;
          }
        },
        beforeUpdate: (doc, options) => {
          if (options.currentUserId) {
            const history = doc.updated_by || [];
            history.push({
              id: options.currentUserId,
              timestamp: new Date().toISOString(),
            });
            doc.updated_by = history;
          }
        },
        beforeDestroy: (doc, options) => {
          if (options.currentUserId) {
            doc.is_deleted = true;
            doc.deleted_by = options.currentUserId;
          }
        },
      },
    }
  );

  return StudentDocument;
};
