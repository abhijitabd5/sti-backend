import { User, Student, Course, StudentEnrollment, Transaction, StudentPayment, StudentDocument, TransactionCategory } from '../models/index.js';
import { Op } from 'sequelize';

class StudentEnrollmentRepository {
  async findUserByAadhar(aadharNumber) {
    return await Student.findOne({
      where: { aadhar_number: aadharNumber },
      include: [{
        model: User,
        as: 'user'
      }]
    });
  }

  async findUserByMobile(mobile) {
    return await User.findOne({
      where: { mobile },
      include: [{
        model: Student,
        as: 'student'
      }]
    });
  }

  async createUser(userData) {
    return await User.create(userData);
  }

  async createStudent(studentData) {
    return await Student.create(studentData);
  }

  async createEnrollment(enrollmentData) {
    return await StudentEnrollment.create(enrollmentData);
  }

  async createTransaction(transactionData) {
    return await Transaction.create(transactionData);
  }

  async createPayment(paymentData) {
    return await StudentPayment.create(paymentData);
  }

  async createDocuments(documentsData) {
    return await StudentDocument.bulkCreate(documentsData);
  }

  async findCourseById(courseId) {
    return await Course.findByPk(courseId);
  }

  async findStudentEnrollments(filters, pagination) {
    const { page = 1, limit = 10, search, status, course } = filters;
    const offset = (page - 1) * limit;

    const whereConditions = {};
    
    if (status) whereConditions.status = status;
    if (course) whereConditions.course_id = course;

    const includeConditions = [
      {
        model: Student,
        as: 'student',
        include: [{
          model: User,
          as: 'user',
          where: search ? {
            [Op.or]: [
              { first_name: { [Op.like]: `%${search}%` } },
              { last_name: { [Op.like]: `%${search}%` } },
              { mobile: { [Op.like]: `%${search}%` } }
            ]
          } : undefined
        }]
      },
      {
        model: Course,
        as: 'course'
      }
    ];

    return await StudentEnrollment.findAndCountAll({
      where: whereConditions,
      include: includeConditions,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });
  }

  async findStudentById(studentId) {
    return await Student.findByPk(studentId, {
      include: [{
        model: User,
        as: 'user'
      }, {
        model: StudentEnrollment,
        as: 'enrollments',
        include: [{
          model: Course,
          as: 'course'
        }]
      }, {
        model: StudentDocument,
        as: 'documents'
      }]
    });
  }

  async findEnrollmentById(enrollmentId) {
    return await StudentEnrollment.findByPk(enrollmentId, {
      include: [{
        model: Student,
        as: 'student',
        include: [{
          model: User,
          as: 'user'
        }]
      }, {
        model: Course,
        as: 'course'
      }]
    });
  }

  async updateEnrollment(enrollmentId, updateData, currentUserId) {
    return await StudentEnrollment.update(updateData, {
      where: { id: enrollmentId },
      currentUserId
    });
  }

  async updateStudent(studentId, updateData, currentUserId) {
    return await Student.update(updateData, {
      where: { id: studentId },
      currentUserId
    });
  }

  async updateUser(userId, updateData, currentUserId) {
    return await User.update(updateData, {
      where: { id: userId },
      currentUserId
    });
  }

  async findTransactionCategories() {
    return await TransactionCategory.findAll({
      where: { is_active: true },
      order: [['display_order', 'ASC']]
    });
  }

  async getStudentPaymentHistory(studentId, enrollmentId) {
    return await StudentPayment.findAll({
      where: { 
        student_id: studentId,
        enrollment_id: enrollmentId
      },
      order: [['payment_date', 'DESC']]
    });
  }

  async findStudentDocuments(studentId) {
    return await StudentDocument.findAll({
      where: { student_id: studentId },
      order: [['uploaded_at', 'DESC']]
    });
  }

  async deleteDocument(documentId, currentUserId) {
    return await StudentDocument.destroy({
      where: { id: documentId },
      currentUserId
    });
  }

  async findAllCourses() {
    return await Course.findAll({
      where: { is_active: true },
      order: [['display_order', 'ASC'], ['title', 'ASC']]
    });
  }
}

export default new StudentEnrollmentRepository();