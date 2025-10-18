// src/migrations/20250818072500-create-student-enrollment.js
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("student_enrollments", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

    student_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "students", key: "id" },
    },

    course_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "courses", key: "id" },
    },

    status: {
      type: Sequelize.ENUM(
        "not_started",
        "ongoing",
        "completed",
        "aborted",
        "expelled"
      ),
      defaultValue: "not_started",
    },

    enrollment_date: { type: Sequelize.DATEONLY, allowNull: false },
    completion_date: { type: Sequelize.DATEONLY, allowNull: true },

    // ---- Course Fee Snapshot (copied from course at enrollment) ----
    base_course_fee: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
    course_discount_amount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
    course_discount_percentage: {
      type: Sequelize.DECIMAL(5, 2),
      defaultValue: 0,
    },
    discounted_course_fee: { type: Sequelize.DECIMAL(10, 2), allowNull: false },

    // ---- Accommodation (always non-taxable) ----
    is_hostel_opted: { type: Sequelize.BOOLEAN, defaultValue: false },
    hostel_fee: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },

    is_mess_opted: { type: Sequelize.BOOLEAN, defaultValue: false },
    mess_fee: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },

    // ---- Total before tax ----
    pre_tax_total_fee: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
      comment: "discounted_course_fee + hostel_fee + mess_fee",
    },

    // ---- Discounts ----
    extra_discount_amount: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
      comment: "Exceptional discount", //  Applied before tax
    },

    // ---- Tax calculation ----
    taxable_amount: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
      comment: "discounted_course_fee - extra_discount_amount", // Excludes hostel and mess
    },
    sgst_percentage: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
    cgst_percentage: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
    sgst_amount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
    cgst_amount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
    igst_applicable: { type: Sequelize.BOOLEAN, defaultValue: false },
    igst_percentage: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
    igst_amount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
    total_tax_amount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },

    // ---- Final Payable ----
    total_payable_fee: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      comment: "taxable_amount + total_tax_amount + hostel_fee + mess_fee",
    },
    paid_amount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
    due_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },

    remark: { type: Sequelize.TEXT, allowNull: true },

    // ---- Audit Fields ----
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
