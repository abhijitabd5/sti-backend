import {
  sequelize,
  User,
  Student,
  Course,
  StudentEnrollment,
  Transaction,
  StudentPayment,
  StudentDocument,
  TransactionCategory,
} from "../models/index.js";
import { Op } from "sequelize";

class StudentRepository {
  async findUserByAadhar(aadharNumber) {
    return await Student.findOne({
      where: { aadhar_number: aadharNumber },
      include: [
        {
          model: User,
          as: "user",
        },
      ],
    });
  }

  async findUserByMobile(mobile) {
    return await User.findOne({
      where: { mobile },
      include: [
        {
          model: Student,
          as: "student",
        },
      ],
    });
  }

  async createUser(userData, options = {}) {
    return await User.create(userData, { transaction: options.transaction });
  }

  async createStudent(studentData, options = {}) {
    return await Student.create(studentData, {
      transaction: options.transaction,
    });
  }

  async createEnrollment(enrollmentData, options = {}) {
    return await StudentEnrollment.create(enrollmentData, {
      transaction: options.transaction,
    });
  }

  async createTransaction(transactionData, options = {}) {
    return await Transaction.create(transactionData, {
      transaction: options.transaction,
    });
  }

  async createPayment(paymentData, options = {}) {
    return await StudentPayment.create(paymentData, {
      transaction: options.transaction,
    });
  }

  async createDocuments(documentsData, options = {}) {
    try {
      console.log("Documents data:", documentsData);
      return await StudentDocument.bulkCreate(documentsData, {
        transaction: options.transaction,
        returning: true,
      });
    } catch (error) {
      console.error("Repository create error:", error);
      throw new Error(`Failed to save documents to database: ${error.message}`);
    }
  }

  async findCourseById(courseId) {
    return await Course.findByPk(courseId);
  }

  async findStudentEnrollments(filters) {
    const { search, status, course } = filters;

    const whereConditions = {};

    if (status) whereConditions.status = status;
    if (course) whereConditions.course_id = course;

    const includeConditions = [
      {
        model: Student,
        as: "student",
        include: [
          {
            model: User,
            as: "user",
            where: search
              ? {
                  [Op.or]: [
                    { first_name: { [Op.like]: `%${search}%` } },
                    { last_name: { [Op.like]: `%${search}%` } },
                    { mobile: { [Op.like]: `%${search}%` } },
                  ],
                }
              : undefined,
          },
        ],
      },
      {
        model: Course,
        as: "course",
      },
    ];

    return await StudentEnrollment.findAndCountAll({
      where: whereConditions,
      include: includeConditions,
      order: [["enrollment_date", "DESC"]], // Sort by enrollment_date instead
    });
  }

  // async findStudentEnrollments(filters) {
  //   const { search, status, course } = filters;

  //   const whereConditions = {};

  //   if (status) whereConditions.status = status;
  //   if (course) whereConditions.course_id = course;

  //   const includeConditions = [
  //     {
  //       model: Student,
  //       as: "student",
  //       include: [
  //         {
  //           model: User,
  //           as: "user",
  //           where: search
  //             ? {
  //                 [Op.or]: [
  //                   { first_name: { [Op.like]: `%${search}%` } },
  //                   { last_name: { [Op.like]: `%${search}%` } },
  //                   { mobile: { [Op.like]: `%${search}%` } },
  //                 ],
  //               }
  //             : undefined,
  //         },
  //       ],
  //     },
  //     {
  //       model: Course,
  //       as: "course",
  //     },
  //   ];

  //   return await StudentEnrollment.findAndCountAll({
  //     where: whereConditions,
  //     include: includeConditions,
  //     order: [["createdAt", "DESC"]],
  //   });
  // }

  async findStudentById(studentId) {
    return await Student.findByPk(studentId, {
      include: [
        {
          model: User,
          as: "user",
        },
        {
          model: StudentEnrollment,
          as: "enrollments",
          include: [
            {
              model: Course,
              as: "course",
            },
          ],
        },
        {
          model: StudentDocument,
          as: "documents",
        },
      ],
    });
  }

  async findEnrollmentById(enrollmentId) {
    return await StudentEnrollment.findByPk(enrollmentId, {
      include: [
        {
          model: Student,
          as: "student",
          include: [
            {
              model: User,
              as: "user",
            },
          ],
        },
        {
          model: Course,
          as: "course",
        },
      ],
    });
  }

  async updateEnrollment(enrollmentId, updateData, options = {}) {
    return await StudentEnrollment.update(updateData, {
      where: { id: enrollmentId },
      transaction: options.transaction,
    });
  }

  async updateStudent(studentId, updateData, options = {}) {
    return await Student.update(updateData, {
      where: { id: studentId },
      transaction: options.transaction,
    });
  }

  async updateUser(userId, updateData, options = {}) {
    return await User.update(updateData, {
      where: { id: userId },
      transaction: options.transaction,
    });
  }

  async findTransactionCategories() {
    return await TransactionCategory.findAll({
      where: { is_active: true },
      order: [["display_order", "ASC"]],
    });
  }

  async validateStudentEnrollment(studentId, enrollmentId) {
    const enrollment = await StudentEnrollment.findOne({
      where: {
        id: enrollmentId,
        student_id: studentId,
      },
    });

    return enrollment !== null;
  }

  async getStudentPaymentHistory(studentId, enrollmentId = null) {
    const whereConditions = {
      student_id: studentId,
    };

    // Only add enrollment_id filter if provided
    if (enrollmentId) {
      whereConditions.enrollment_id = enrollmentId;
    }

    return await StudentPayment.findAll({
      where: whereConditions,
      include: [
        {
          model: StudentEnrollment,
          as: "enrollment",
          include: [
            {
              model: Course,
              as: "course",
              attributes: ["id", "title"],
            },
          ],
          attributes: ["id", "status"],
        },
      ],
      order: [["payment_date", "DESC"]],
    });
  }

  async findStudentDocuments(studentId) {
    return await StudentDocument.findAll({
      where: { student_id: studentId },
      order: [["uploaded_at", "DESC"]],
    });
  }

  async deleteDocument(documentId, options = {}) {
    return await StudentDocument.destroy({
      where: { id: documentId },
      transaction: options.transaction,
    });
  }

  async findLastStudent() {
    return await Student.findOne({
      order: [["id", "DESC"]],
      paranoid: false, // include soft deleted
    });
  }

  async findAllCourses() {
    return await Course.findAll({
      where: { is_active: true },
      order: [
        ["display_order", "ASC"],
        ["title", "ASC"],
      ],
    });
  }
}

export default new StudentRepository();
