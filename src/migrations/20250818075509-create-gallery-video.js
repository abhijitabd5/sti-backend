// src/migrations/20250818075509-create-gallery-video.js
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("gallery_videos", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: Sequelize.STRING, allowNull: false },
    video_url: { type: Sequelize.STRING, allowNull: false },
    thumbnail: { type: Sequelize.STRING },
    slug: { type: Sequelize.STRING, allowNull: false, unique: true },
    display_order: { type: Sequelize.INTEGER, defaultValue: 0 },
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
  await queryInterface.dropTable("gallery_videos");
}
