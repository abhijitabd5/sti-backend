// src/migrations/20250818075248-create-course.js

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("courses", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    course_group_id: { type: Sequelize.INTEGER, allowNull: false},
    title: { type: Sequelize.STRING, allowNull: false },
    slug: { type: Sequelize.STRING, allowNull: false, unique: true },
    language: { type: Sequelize.ENUM("en", "hi", "mar"), defaultValue: "en" },
    summary: { type: Sequelize.TEXT, allowNull: false },
    description: { type: Sequelize.TEXT("long"), allowNull: false },
    duration: { type: Sequelize.INTEGER, allowNull: false },
    syllabus_text: { type: Sequelize.TEXT },
    syllabus_file_path: { type: Sequelize.STRING },
    original_fee: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
    is_discounted: { type: Sequelize.BOOLEAN, defaultValue: false },
    discounted_fee: { type: Sequelize.DECIMAL(10, 2) },
    discount_percentage: { type: Sequelize.DECIMAL(5, 2) },
    show_offer_badge: { type: Sequelize.BOOLEAN, defaultValue: false },
    offer_badge_text: { type: Sequelize.STRING },
    thumbnail: { type: Sequelize.STRING },
    is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
    display_order: { type: Sequelize.INTEGER, defaultValue: 0 },
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
  await queryInterface.dropTable("courses");
}
