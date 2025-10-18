// src/migrations/20250818075449-create-page-content.js


export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("page_contents", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    page_id: { type: Sequelize.INTEGER, allowNull: false },
    page_name: { type: Sequelize.STRING, allowNull: false },
    section_key: { type: Sequelize.STRING, allowNull: false },
    section_name: { type: Sequelize.STRING, allowNull: false },
    language: { type: Sequelize.ENUM("en", "hi", "mar"), allowNull: false },
    title: { type: Sequelize.STRING },
    subtitle: { type: Sequelize.STRING },
    content: { type: Sequelize.TEXT("long"), allowNull: false },
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
  await queryInterface.dropTable("page_contents");
}
