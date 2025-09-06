// src/migrations/20250818075519-create-review.js
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("reviews", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    student_id: {
      type: Sequelize.INTEGER,
      references: { model: "students", key: "id" },
    },
    phone: { type: Sequelize.STRING },
    review_text: { type: Sequelize.TEXT, allowNull: false },
    rating: { type: Sequelize.INTEGER, allowNull: false },
    is_approved: { type: Sequelize.BOOLEAN, defaultValue: false },
    is_enrolled_student: { type: Sequelize.BOOLEAN, defaultValue: false },
    display_order: { type: Sequelize.INTEGER, defaultValue: 0 },
    qr_code_url: { type: Sequelize.STRING, allowNull: false },
    created_by: { type: Sequelize.INTEGER, allowNull: false },
    updated_by: { type: Sequelize.JSON },
    is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
    deleted_by: { type: Sequelize.INTEGER },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
    deletedAt: { type: Sequelize.DATE },
  });
}
export async function down(queryInterface) {
  await queryInterface.dropTable("reviews");
}
