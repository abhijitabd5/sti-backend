// src/migrations/20250818075311-create-certificate.js
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("certificates", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

    certificate_number: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    student_id: { type: Sequelize.INTEGER, allowNull: false },
    course_id: { type: Sequelize.INTEGER, allowNull: false },

    issue_date: { type: Sequelize.DATEONLY, allowNull: false },
    file_path: { type: Sequelize.STRING, allowNull: false },

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
