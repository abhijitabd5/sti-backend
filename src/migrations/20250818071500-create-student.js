// src/migrations/20250818071500-create-student.js
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("students", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: "users", key: "id" },
    },
    student_code: { type: Sequelize.STRING, allowNull: false, unique: true },
    name_on_id: { type: Sequelize.STRING, allowNull: false },
    father_name: { type: Sequelize.STRING, allowNull: true },
    mother_name: { type: Sequelize.STRING, allowNull: true },
    date_of_birth: { type: Sequelize.DATEONLY, allowNull: false },
    gender: { type: Sequelize.STRING, allowNull: false },
    address: { type: Sequelize.TEXT, allowNull: false },
    state: { type: Sequelize.STRING, allowNull: false },
    city: { type: Sequelize.STRING, allowNull: false },
    pincode: { type: Sequelize.STRING, allowNull: false },
    enrollment_date: { type: Sequelize.DATEONLY, allowNull: false },
    aadhar_number: { type: Sequelize.STRING, allowNull: false },
    pan_number: { type: Sequelize.STRING, allowNull: true },
    login_enabled: { type: Sequelize.BOOLEAN, defaultValue: true },
    last_login_at: { type: Sequelize.DATE, allowNull: true },
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
  await queryInterface.dropTable("students");
}
