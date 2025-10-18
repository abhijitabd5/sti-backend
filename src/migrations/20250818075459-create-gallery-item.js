export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("gallery_items", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    media_type: { type: Sequelize.ENUM("photo", "video"), allowNull: false },
    caption: { type: Sequelize.STRING, allowNull: true },
    title: { type: Sequelize.STRING, allowNull: true },
    slug: { type: Sequelize.STRING, allowNull: false, unique: true },
    is_media_remote: { type: Sequelize.BOOLEAN, defaultValue: false },
    media_path: { type: Sequelize.STRING, allowNull: true },
    is_thumbnail_remote: { type: Sequelize.BOOLEAN, defaultValue: false },
    thumbnail_path: { type: Sequelize.STRING, allowNull: true },
    display_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
    is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
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
  await queryInterface.dropTable("gallery_items");
}