// src/migrations/20250818075300-create-student-enrollment.js
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("student_enrollments", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

    student_id: { type: Sequelize.INTEGER, allowNull: false },
    course_id: { type: Sequelize.INTEGER, allowNull: false },

    status: {
      type: Sequelize.ENUM("not_started", "ongoing", "completed", "aborted"),
      defaultValue: "not_started",
    },

    enrollment_date: { type: Sequelize.DATEONLY, allowNull: false },
    completion_date: { type: Sequelize.DATEONLY, allowNull: true },

    base_course_fee: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
    course_discount_amount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
    course_discount_percentage: {
      type: Sequelize.DECIMAL(5, 2),
      defaultValue: 0,
    },

    is_hostel_opted: { type: Sequelize.BOOLEAN, defaultValue: false },
    is_mess_opted: { type: Sequelize.BOOLEAN, defaultValue: false },
    hostel_fee: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
    mess_fee: { type: Sequelize.DECIMAL(10, 2), allowNull: true },

    accommodation_discount_amount: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    },
    accommodation_discount_percentage: {
      type: Sequelize.DECIMAL(5, 2),
      defaultValue: 0,
    },
    accommodation_total_amount: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    },

    pre_tax_total_fee: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
      comment: "Discounted course fee inclusive of accommodation",
    },
    taxable_amount: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
      comment:
        "Discounted course fee exclusive of non-taxable accommodation fees",
    },

    sgst_percentage: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
    cgst_percentage: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
    sgst_amount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
    cgst_amount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },

    total_payable_fee: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
    paid_amount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
    due_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },

    remark: { type: Sequelize.TEXT, allowNull: true },

    created_by: { type: Sequelize.INTEGER, allowNull: true },
    updated_by: { type: Sequelize.JSON, defaultValue: [] },
    is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
    deleted_by: { type: Sequelize.INTEGER, allowNull: true },

    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
    deletedAt: { type: Sequelize.DATE, allowNull: true },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("student_enrollments");
}
