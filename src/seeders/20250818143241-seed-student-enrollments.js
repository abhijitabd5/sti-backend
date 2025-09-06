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

async function getFirstCourse(queryInterface, Sequelize) {
  const results = await queryInterface.sequelize.query(
    `SELECT id, base_course_fee, discount_amount, discount_percentage, 
            discounted_course_fee, hostel_fee, mess_fee
     FROM courses 
     WHERE is_active = true 
     ORDER BY id ASC LIMIT 1`,
    { type: Sequelize.QueryTypes.SELECT }
  );
  return results[0] || null;
}

export async function up(queryInterface, Sequelize) {
  const student1 = await getStudentId(queryInterface, Sequelize, "9834892082");
  const student2 = await getStudentId(queryInterface, Sequelize, "9764233336");
  const course = await getFirstCourse(queryInterface, Sequelize);

  if (!student1 || !student2 || !course) {
    throw new Error("Failed to fetch necessary data for seeding enrollments.");
  }

  // ---- Snapshot values from course ----
  const baseFee = parseFloat(course.base_course_fee);
  const discountAmt = parseFloat(course.discount_amount);
  const discountPct = parseFloat(course.discount_percentage);
  const discountedFee = parseFloat(course.discounted_course_fee);

  const hostelFee = parseFloat(course.hostel_fee) || 0;
  const messFee = parseFloat(course.mess_fee) || 0;

  // ---- Taxation ----
  const extraDiscount = 0;
  const taxableAmount = discountedFee - extraDiscount;
  const sgstPct = 5;
  const cgstPct = 5;
  const sgst = taxableAmount * (sgstPct / 100);
  const cgst = taxableAmount * (cgstPct / 100);
  const totalTax = sgst + cgst;

  // ---- Totals ----
  const preTaxTotal = discountedFee + hostelFee + messFee;
  const totalPayable = taxableAmount + totalTax + hostelFee + messFee;

  const enrollmentData = [student1, student2].map((studentId) => ({
    student_id: studentId,
    course_id: course.id,
    status: "ongoing",
    enrollment_date: new Date(),

    // snapshot fields
    base_course_fee: baseFee,
    course_discount_amount: discountAmt,
    course_discount_percentage: discountPct,
    discounted_course_fee: discountedFee,

    // accommodation snapshot
    is_hostel_opted: hostelFee > 0,
    hostel_fee: hostelFee,
    is_mess_opted: messFee > 0,
    mess_fee: messFee,

    // fee calculations
    pre_tax_total_fee: preTaxTotal,
    extra_discount_amount: extraDiscount,
    taxable_amount: taxableAmount,

    sgst_percentage: sgstPct,
    cgst_percentage: cgstPct,
    sgst_amount: sgst,
    cgst_amount: cgst,
    total_tax_amount: totalTax,

    total_payable_fee: totalPayable,
    paid_amount: 0,
    due_amount: totalPayable,

    remark: "Auto-enrolled via seeder",
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await queryInterface.bulkInsert("student_enrollments", enrollmentData);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete("student_enrollments", null, {});
}
