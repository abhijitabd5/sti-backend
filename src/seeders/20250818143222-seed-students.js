// src/seeders/20250818143222-seed-students.js

async function getUserId(queryInterface, Sequelize, mobile) {
  const results = await queryInterface.sequelize.query(
    `SELECT id FROM users WHERE mobile = :mobile LIMIT 1`,
    {
      replacements: { mobile },
      type: Sequelize.QueryTypes.SELECT,
    }
  );
  return results[0]?.id || null;
}

export async function up(queryInterface, Sequelize) {
  const saifUserId = await getUserId(queryInterface, Sequelize, "9834892082");
  const shubhamUserId = await getUserId(
    queryInterface,
    Sequelize,
    "9764233336"
  );

  await queryInterface.bulkInsert("students", [
    {
      user_id: saifUserId,
      student_code: "STI202500001",
      name_on_id: "Saiffuddin Sheikh",
      date_of_birth: "2000-01-01",
      gender: "male",
      address: "Pune, Maharashtra",
      state: "Maharashtra",
      city: "Pune",
      pincode: "411001",
      enrollment_date: new Date(),
      aadhar_number: "777788889999",
      pan_number: null,
      login_enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      user_id: shubhamUserId,
      student_code: "STI202500002",
      name_on_id: "Shubham Malewar",
      date_of_birth: "2001-05-15",
      gender: "male",
      address: "Nagpur, Maharashtra",
      state: "Maharashtra",
      city: "Nagpur",
      pincode: "440001",
      enrollment_date: new Date(),
      aadhar_number: "666677778888",
      pan_number: null,
      login_enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("students", {
    student_code: ["STI202500001", "STI202500002"],
  });
}
