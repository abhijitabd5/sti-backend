// src/models/student.js

import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Student extends Model {
    static associate(models) {
      Student.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
      Student.hasMany(models.StudentDocument, {
        foreignKey: "student_id",
        as: "documents",
      });
      Student.hasMany(models.StudentEnrollment, {
        foreignKey: "student_id",
        as: "enrollments",
      });
    }
  }

  Student.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      student_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: "Formatted like STI202500001",
      },
      name_on_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      father_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mother_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pincode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      enrollment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      aadhar_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pan_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      login_enabled: {
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
      modelName: "Student",
      tableName: "students",
      timestamps: true,
      paranoid: true,
      hooks: {
        beforeCreate: (student, options) => {
          if (options.currentUserId) {
            student.created_by = options.currentUserId;
          }
        },
        beforeUpdate: (student, options) => {
          if (options.currentUserId) {
            const history = student.updated_by || [];
            history.push({
              id: options.currentUserId,
              timestamp: new Date().toISOString(),
            });
            student.updated_by = history;
          }
        },
        beforeDestroy: (student, options) => {
          if (options.currentUserId) {
            student.is_deleted = true;
            student.deleted_by = options.currentUserId;
          }
        },
      },
    }
  );

  return Student;
};
