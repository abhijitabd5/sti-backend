// src/migrations/20250818073000-create-student-document.js
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("student_documents", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    student_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "students", key: "id" },
    },
    slug: {
      type: Sequelize.ENUM(
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
    file_path: { type: Sequelize.STRING, allowNull: false },
    file_name: { type: Sequelize.STRING, allowNull: false },
    is_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
    uploaded_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    created_by: { type: Sequelize.INTEGER },
    updated_by: { type: Sequelize.JSON, defaultValue: [] },
    is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
    deleted_by: { type: Sequelize.INTEGER },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
    deletedAt: { type: Sequelize.DATE },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("student_documents");
}
