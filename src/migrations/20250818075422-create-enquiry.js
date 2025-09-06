// src/migrations/20250818075422-create-enquiry.js

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("enquiries", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    email: { type: Sequelize.STRING },
    phone: { type: Sequelize.STRING, allowNull: false },
    course_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "courses", key: "id" },
    },
    message: { type: Sequelize.TEXT, allowNull: false },
    status: {
      type: Sequelize.ENUM("unread", "read", "action_taken"),
      defaultValue: "unread",
    },
    is_action_taken: { type: Sequelize.BOOLEAN, defaultValue: false },
    action_type: {
      type: Sequelize.ENUM(
        "call",
        "whatsapp",
        "email",
        "text_message",
        "visit"
      ),
      allowNull: true,
    },
    remark: { type: Sequelize.TEXT },
    created_by: { type: Sequelize.INTEGER },
    updated_by: { type: Sequelize.JSON },
    is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
    deleted_by: { type: Sequelize.INTEGER },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
    deletedAt: { type: Sequelize.DATE },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("enquiries");
}
