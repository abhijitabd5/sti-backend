// src/models/certificate.js

import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Certificate extends Model {
    static associate(models) {
      Certificate.belongsTo(models.Student, {
        foreignKey: "student_id",
        as: "student",
      });
      Certificate.belongsTo(models.Course, {
        foreignKey: "course_id",
        as: "course",
      });
      Certificate.belongsTo(models.StudentEnrollment, {
        foreignKey: "enrollment_id",
        as: "enrollment",
      });
    }
  }

  Certificate.init(
    {
      certificate_number: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      student_id: { type: DataTypes.INTEGER, allowNull: false },
      student_code: {type: DataTypes.STRING, allowNull: false},
      course_id: { type: DataTypes.INTEGER, allowNull: false },
      enrollment_id: { type: DataTypes.INTEGER, allowNull: false },
      issue_date: { type: DataTypes.DATEONLY, allowNull: false },
      file_path: { type: DataTypes.STRING, allowNull: false },
      hard_copy_delivered: { type: DataTypes.BOOLEAN, defaultValue: false },
      delivery_address: { type: DataTypes.STRING, allowNull: true },
      status: {
        type: DataTypes.ENUM("valid", "revoked", "expired"),
        defaultValue: "valid",
      },
      created_by: { type: DataTypes.INTEGER },
      updated_by: { type: DataTypes.JSON, defaultValue: [] },
      is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      deleted_by: { type: DataTypes.INTEGER },
    },
    {
      sequelize,
      modelName: "Certificate",
      tableName: "certificates",
      timestamps: true,
      paranoid: true,
      hooks: {
        beforeCreate: (cert, options) => {
          if (options.currentUserId) cert.created_by = options.currentUserId;
        },
        beforeUpdate: (cert, options) => {
          if (options.currentUserId) {
            const history = cert.updated_by || [];
            history.push({
              id: options.currentUserId,
              timestamp: new Date().toISOString(),
            });
            cert.updated_by = history;
          }
        },
        beforeDestroy: (cert, options) => {
          if (options.currentUserId) {
            cert.is_deleted = true;
            cert.deleted_by = options.currentUserId;
          }
        },
      },
    }
  );

  return Certificate;
};
