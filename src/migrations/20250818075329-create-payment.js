// src/migrations/20250818075329-create-payment.js
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("payments", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

    student_id: { type: Sequelize.INTEGER, allowNull: false },
    course_id: { type: Sequelize.INTEGER, allowNull: true },

    amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
    discount_amount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
    net_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },

    payment_date: { type: Sequelize.DATEONLY, allowNull: false },
    payment_method: { type: Sequelize.STRING, allowNull: false },
    description: { type: Sequelize.TEXT, allowNull: true },

    receipt_number: { type: Sequelize.STRING, allowNull: false, unique: true },

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
  await queryInterface.dropTable("payments");
}
