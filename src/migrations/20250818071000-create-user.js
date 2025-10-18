// src/migrations/20250818071000-create-user.js
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("users", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    first_name: { type: Sequelize.STRING, allowNull: false },
    last_name: { type: Sequelize.STRING, allowNull: false },
    mobile: { type: Sequelize.STRING, allowNull: false, unique: true },
    email: { type: Sequelize.STRING, allowNull: true },
    password: { type: Sequelize.STRING, allowNull: false },
    role: {
      type: Sequelize.ENUM(
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
    profile_image: { type: Sequelize.STRING, allowNull: true },
    is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
    last_login_at: { type: Sequelize.DATE, allowNull: true },
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
  await queryInterface.dropTable("users");
}
