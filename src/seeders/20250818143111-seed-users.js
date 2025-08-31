// src/seeders/20250818143111-seed-users.js

import bcrypt from "bcrypt";

export async function up(queryInterface, Sequelize) {
  const passwordHash = await bcrypt.hash("12345678", 10);

  await queryInterface.bulkInsert("users", [
    {
      first_name: "Abhijit",
      last_name: "Abd",
      mobile: "9175113022",
      role: "super_admin",
      password: passwordHash,
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      first_name: "Shahabuddin",
      last_name: "Khan",
      mobile: "9300111222",
      role: "super_admin",
      password: passwordHash,
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      first_name: "Account",
      last_name: "Dept",
      mobile: "9300333444",
      role: "account",
      password: passwordHash,
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      first_name: "Saif",
      last_name: "Sheikh",
      mobile: "9834892082",
      role: "student",
      password: passwordHash,
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      first_name: "Shubham",
      last_name: "Malewar",
      mobile: "9764233336",
      role: "student",
      password: passwordHash,
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("users", {
    mobile: [
      "9175113022",
      "9300111222",
      "9300333444",
      "9834892082",
      "9764233336",
    ],
  });
}
