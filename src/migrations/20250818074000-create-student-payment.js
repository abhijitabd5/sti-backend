// src/migrations/20250818074000-create-student-payment.js

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("student_payments", {
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

    enrollment_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "student_enrollments", key: "id" },
    },
    type: {
      type: Sequelize.ENUM(
        "course_fee",
        "accommodation_fee",
        "penalty",
        "miscellaneous"
      ),
    },

    amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },

    payment_date: { type: Sequelize.DATEONLY, allowNull: false },
    payment_method: {
      type: Sequelize.ENUM(
        "cash",
        "cheque",
        "upi",
        "bank_transfer",
        "card",
        "net_banking",
        "payment_gateway"
      ),
      allowNull: false,
    },

    // Track dues before & after this payment
    previous_due_amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: "Due amount before applying this payment",
    },
    remaining_due_amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: "Due amount after applying this payment",
    },

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
  await queryInterface.dropTable("student_payments");
}
