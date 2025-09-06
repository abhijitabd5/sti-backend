// src/migrations/20250818072000-create-course.js

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("courses", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    course_group_id: { type: Sequelize.INTEGER, allowNull: false },
    title: { type: Sequelize.STRING, allowNull: false },
    slug: { type: Sequelize.STRING, allowNull: false, unique: true },
    language: {
      type: Sequelize.ENUM("en", "hi", "mar"),
      defaultValue: "en",
    },
    summary: { type: Sequelize.TEXT, allowNull: false },
    description: { type: Sequelize.TEXT("long"), allowNull: false },
    duration: { type: Sequelize.INTEGER, allowNull: false },
    syllabus_text: { type: Sequelize.TEXT },
    syllabus_file_path: { type: Sequelize.STRING },

    // Fees
    base_course_fee: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
    is_discounted: { type: Sequelize.BOOLEAN, defaultValue: true },
    discount_percentage: {
      type: Sequelize.DECIMAL(5, 2),
      defaultValue: 0.0,
      comment: "course fee only",
    },
    discount_amount: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.0,
      comment: "course fee only",
    },
    discounted_course_fee: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      comment: "course fee after discount",
    },
    hostel_available: { type: Sequelize.BOOLEAN, defaultValue: false },
    hostel_fee: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.0 },
    mess_available: { type: Sequelize.BOOLEAN, defaultValue: false },
    mess_fee: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.0 },
    total_fee: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      comment: "discounted course fee + hostel + mess (default reference)",
    },

    // Marketing / Display
    show_offer_badge: { type: Sequelize.BOOLEAN, defaultValue: false },
    offer_badge_text: { type: Sequelize.STRING },
    thumbnail: { type: Sequelize.STRING },
    is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
    display_order: { type: Sequelize.INTEGER, defaultValue: 0 },

    // Audit
    created_by: { type: Sequelize.INTEGER },
    updated_by: { type: Sequelize.JSON, defaultValue: [] },
    is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
    deleted_by: { type: Sequelize.INTEGER },

    // Sequelize timestamps + soft delete
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
    deletedAt: { type: Sequelize.DATE },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("courses");
}
