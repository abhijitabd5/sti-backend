// src/migrations/20250818075311-create-certificate.js
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("certificates", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

    certificate_number: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    student_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "students",
        key: "id",
      },
    },

    course_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "courses",
        key: "id",
      },
    },
    enrollment_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "student_enrollments",
        key: "id",
      },
    },

    issue_date: { type: Sequelize.DATEONLY, allowNull: false },
    file_path: { type: Sequelize.STRING, allowNull: false },
    hard_copy_delivered: { type: Sequelize.BOOLEAN, defaultValue: false },
    delivery_address: { type: Sequelize.STRING, allowNull: true },

    status: {
      type: Sequelize.ENUM("valid", "revoked", "expired"),
      defaultValue: "valid",
    },

    created_by: { type: Sequelize.INTEGER, allowNull: true },
    updated_by: { type: Sequelize.JSON, defaultValue: [] },
    is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
    deleted_by: { type: Sequelize.INTEGER, allowNull: true },

    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
    deletedAt: { type: Sequelize.DATE, allowNull: true },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("certificates");
}
