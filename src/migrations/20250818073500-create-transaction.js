// src/migrations/20250818073540-create-transaction.js
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("transactions", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

    type: {
      type: Sequelize.ENUM("income", "expense"),
      allowNull: false,
    },

    category_id: {
      type: Sequelize.INTEGER,
      references: { model: "transaction_categories", key: "id" },
    },
    student_id: {
      type: Sequelize.INTEGER,
      references: { model: "students", key: "id" },
    },
    expense_for_user: {
      type: Sequelize.INTEGER,
      references: { model: "users", key: "id" },
    },
    course_id: {
      type: Sequelize.INTEGER,
      references: { model: "courses", key: "id" },
    },
    enrollment_id: {
      type: Sequelize.INTEGER,
      references: { model: "student_enrollments", key: "id" },
    },

    amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
    transaction_date: { type: Sequelize.DATEONLY, allowNull: false },

    payment_mode: {
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
    description: { type: Sequelize.TEXT },

    // Payment identifiers
    payment_ref_num: { type: Sequelize.STRING, allowNull: true },
    payment_ref_type: {
      type: Sequelize.ENUM(
        "receipt",
        "transaction",
        "cheque",
        "invoice",
        "other"
      ),
      defaultValue: "other",
    },

    // Payer (for income)
    payer_name: { type: Sequelize.STRING },
    payer_contact: { type: Sequelize.STRING },
    payer_bank_name: { type: Sequelize.STRING },
    payer_account_number: { type: Sequelize.STRING },
    payer_upi_id: { type: Sequelize.STRING },

    // Payee (for expense)
    payee_name: { type: Sequelize.STRING },
    payee_contact: { type: Sequelize.STRING },
    payee_bank_name: { type: Sequelize.STRING },
    payee_account_number: { type: Sequelize.STRING },
    payee_upi_id: { type: Sequelize.STRING },

    // Attachments
    attachment_type: {
      type: Sequelize.ENUM("invoice", "receipt", "proof", "other"),
      defaultValue: "other",
      allowNull: false,
    },
    attachment_path: { type: Sequelize.STRING },
    reference_note: { type: Sequelize.TEXT },

    // Audit
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
  await queryInterface.dropTable("transactions");
}
