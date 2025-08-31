// src/migrations/20250818075459-create-gallery-photo.js
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('gallery_photos', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    caption: { type: Sequelize.STRING, allowNull: false },
    slug: { type: Sequelize.STRING, allowNull: false, unique: true },
    image_path: { type: Sequelize.STRING, allowNull: false },
    display_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
    created_by: { type: Sequelize.INTEGER, allowNull: false },
    updated_by: { type: Sequelize.JSON },
    is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
    deleted_by: { type: Sequelize.INTEGER },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
    deletedAt: { type: Sequelize.DATE }
  });
}
export async function down(queryInterface) {
  await queryInterface.dropTable('gallery_photos');
}
