// src/migrations/20250818075439-create-page.js

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("pages", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    slug: { type: Sequelize.STRING, unique: true, allowNull: false },
    language: { type: Sequelize.ENUM("en", "hi", "mar"), allowNull: false },
    page_title: { type: Sequelize.STRING },
    meta_title: { type: Sequelize.STRING },
    meta_description: { type: Sequelize.STRING },
    meta_keywords: { type: Sequelize.STRING },
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
  await queryInterface.dropTable("pages");
}
