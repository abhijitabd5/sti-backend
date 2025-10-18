// src/migrations/20250818073510-create-transaction-category.js
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("transaction_categories", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

    name: { type: Sequelize.STRING, allowNull: false, unique: true },
    slug: { type: Sequelize.STRING, allowNull: false, unique: true },
    type: {
      type: Sequelize.ENUM("income", "expense"),
      allowNull: false,
    },
    is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
    display_order: { type: Sequelize.INTEGER, defaultValue: 0 },

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
  await queryInterface.dropTable("transaction_categories");
}
