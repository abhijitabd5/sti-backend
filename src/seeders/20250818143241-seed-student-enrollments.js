// src/seeders/20250818143241-seed-student-enrollments.js

async function getStudentId(queryInterface, Sequelize, mobile) {
  const results = await queryInterface.sequelize.query(
    `SELECT s.id FROM students s 
     JOIN users u ON s.user_id = u.id 
     WHERE u.mobile = :mobile LIMIT 1`,
    {
      replacements: { mobile },
      type: Sequelize.QueryTypes.SELECT,
    }
  );
  return results[0]?.id || null;
}

async function getFirstCourseId(queryInterface, Sequelize) {
  const results = await queryInterface.sequelize.query(
    `SELECT id, discounted_fee FROM courses ORDER BY id ASC LIMIT 1`,
    { type: Sequelize.QueryTypes.SELECT }
  );
  return results[0] || null;
}

export async function up(queryInterface, Sequelize) {
  const student1 = await getStudentId(queryInterface, Sequelize, "9834892082");
  const student2 = await getStudentId(queryInterface, Sequelize, "9764233336");
  const course = await getFirstCourseId(queryInterface, Sequelize);

  if (!student1 || !student2 || !course) {
    throw new Error("Failed to fetch necessary data for seeding enrollments.");
  }

  const taxableAmount = course.discounted_fee;
  const sgst = taxableAmount * 0.05;
  const cgst = taxableAmount * 0.05;
  const totalPayable = taxableAmount + sgst + cgst;
  const accommodationFee = 8000;

  const enrollmentData = [student1, student2].map((studentId) => ({
    student_id: studentId,
    course_id: course.id,
    status: "ongoing",
    enrollment_date: new Date(),
    base_course_fee: taxableAmount,
    course_discount_amount: 0,
    course_discount_percentage: 0,
    is_hostel_opted: true,
    is_mess_opted: true,
    hostel_fee: 5000,
    mess_fee: 3000,
    accommodation_discount_amount: 0,
    accommodation_discount_percentage: 0,
    accommodation_total_amount: accommodationFee,
    pre_tax_total_fee: taxableAmount + accommodationFee,
    taxable_amount: taxableAmount,
    sgst_percentage: 5,
    cgst_percentage: 5,
    sgst_amount: sgst,
    cgst_amount: cgst,
    total_payable_fee: totalPayable + accommodationFee,
    paid_amount: 0,
    due_amount: totalPayable + accommodationFee,
    remark: "Auto-enrolled via seeder",
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await queryInterface.bulkInsert("student_enrollments", enrollmentData);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("student_enrollments", null, {});
}
