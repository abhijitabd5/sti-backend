import StudentEnrollmentRepository from '../repositories/StudentEnrollmentRepository.js';
import { generateStudentId } from '../utils/slugify.js';
import { hashPassword } from '../utils/bcrypt.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

class StudentEnrollmentService {
  async checkAadharExists(aadharNumber) {
    const student = await StudentEnrollmentRepository.findUserByAadhar(aadharNumber);
    
    if (student) {
      return {
        exists: true,
        student: {
          id: student.id,
          student_code: student.student_code,
          name: student.name_on_id,
          mobile: student.user?.mobile,
          email: student.user?.email,
          enrollments: student.enrollments || []
        }
      };
    }

    return { exists: false };
  }

  async createNewEnrollment(enrollmentData, currentUserId) {
    const transaction = await sequelize.transaction();

    try {
      const { 
        aadhar_number, name_on_id, father_name, mother_name, date_of_birth, 
        gender, address, state, city, pincode, mobile, email,
        course_id, enrollment_date, status, extra_discount_amount,
        is_hostel_opted, is_mess_opted, paid_amount, payment_method,
        documents, remark, igst_applicable
      } = enrollmentData;

      const course = await StudentEnrollmentRepository.findCourseById(course_id);
      if (!course) throw new Error('Course not found');

      const student = await StudentEnrollmentRepository.findUserByAadhar(aadhar_number);
      let user, studentRecord;

      if (!student) {
        const existingUser = await StudentEnrollmentRepository.findUserByMobile(mobile);
        if (existingUser && existingUser.student) {
          throw new Error('Mobile number already registered with another student');
        }

        const hashedPassword = await hashPassword(mobile);
        
        user = await StudentEnrollmentRepository.createUser({
          first_name: name_on_id.split(' ')[0],
          last_name: name_on_id.split(' ').slice(1).join(' '),
          mobile,
          email: email || null,
          password: hashedPassword,
          role: 'student',
          created_by: currentUserId
        }, { transaction, currentUserId });

        const studentCode = await generateStudentId(name_on_id, new Date().getFullYear());

        studentRecord = await StudentEnrollmentRepository.createStudent({
          user_id: user.id,
          student_code: studentCode,
          name_on_id,
          father_name: father_name || null,
          mother_name: mother_name || null,
          date_of_birth,
          gender,
          address,
          state,
          city,
          pincode,
          enrollment_date,
          aadhar_number,
          created_by: currentUserId
        }, { transaction, currentUserId });
      } else {
        studentRecord = student;
        user = student.user;
      }

      const feeCalculation = this.calculateFees(course, {
        extra_discount_amount: extra_discount_amount || 0,
        is_hostel_opted: is_hostel_opted || false,
        is_mess_opted: is_mess_opted || false,
        igst_applicable: igst_applicable || false
      });

      const enrollment = await StudentEnrollmentRepository.createEnrollment({
        student_id: studentRecord.id,
        course_id,
        status: status || 'not_started',
        enrollment_date,
        base_course_fee: course.base_course_fee,
        course_discount_amount: (course.base_course_fee * course.discount_percentage) / 100,
        course_discount_percentage: course.discount_percentage,
        discounted_course_fee: course.discounted_course_fee,
        is_hostel_opted: is_hostel_opted || false,
        hostel_fee: is_hostel_opted ? course.hostel_fee : 0,
        is_mess_opted: is_mess_opted || false,
        mess_fee: is_mess_opted ? course.mess_fee : 0,
        pre_tax_total_fee: feeCalculation.preTaxTotal,
        extra_discount_amount: extra_discount_amount || 0,
        taxable_amount: feeCalculation.taxableAmount,
        igst_applicable: igst_applicable || false,
        sgst_percentage: igst_applicable ? 0 : feeCalculation.sgstPercentage,
        cgst_percentage: igst_applicable ? 0 : feeCalculation.cgstPercentage,
        igst_percentage: igst_applicable ? feeCalculation.igstPercentage : 0,
        sgst_amount: igst_applicable ? 0 : feeCalculation.sgstAmount,
        cgst_amount: igst_applicable ? 0 : feeCalculation.cgstAmount,
        igst_amount: igst_applicable ? feeCalculation.igstAmount : 0,
        total_tax_amount: feeCalculation.totalTaxAmount,
        total_payable_fee: feeCalculation.totalPayableFee,
        paid_amount: paid_amount || 0,
        due_amount: feeCalculation.totalPayableFee - (paid_amount || 0),
        remark: remark || null,
        created_by: currentUserId
      }, { transaction, currentUserId });

      if (paid_amount && paid_amount > 0) {
        await StudentEnrollmentRepository.createTransaction({
          type: 'income',
          category_id: 1,
          student_id: studentRecord.id,
          course_id,
          enrollment_id: enrollment.id,
          amount: paid_amount,
          transaction_date: enrollment_date,
          payment_mode: payment_method,
          description: `Course fee payment for ${course.title}`,
          payer_name: name_on_id,
          payer_contact: mobile,
          created_by: currentUserId
        }, { transaction, currentUserId });

        await StudentEnrollmentRepository.createPayment({
          student_id: studentRecord.id,
          course_id,
          enrollment_id: enrollment.id,
          type: 'course_fee',
          amount: paid_amount,
          payment_date: enrollment_date,
          payment_method,
          previous_due_amount: feeCalculation.totalPayableFee,
          remaining_due_amount: feeCalculation.totalPayableFee - paid_amount,
          created_by: currentUserId
        }, { transaction, currentUserId });
      }

      if (documents && documents.length > 0) {
        const documentData = documents.map(doc => ({
          student_id: studentRecord.id,
          slug: doc.slug,
          file_path: doc.file_path,
          file_name: doc.file_name,
          created_by: currentUserId
        }));

        await StudentEnrollmentRepository.createDocuments(documentData, { transaction, currentUserId });
      }

      await transaction.commit();

      return {
        success: true,
        message: 'Student enrolled successfully',
        data: {
          enrollment_id: enrollment.id,
          student_id: studentRecord.id,
          student_code: studentRecord.student_code,
          total_fee: feeCalculation.totalPayableFee,
          paid_amount: paid_amount || 0,
          due_amount: feeCalculation.totalPayableFee - (paid_amount || 0)
        }
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  calculateFees(course, options) {
    const { extra_discount_amount, is_hostel_opted, is_mess_opted, igst_applicable } = options;

    const sgstRate = parseFloat(process.env.SGST_PERCENTAGE || 9);
    const cgstRate = parseFloat(process.env.CGST_PERCENTAGE || 9);
    const igstRate = parseFloat(process.env.IGST_PERCENTAGE || 18);

    const hostelFee = is_hostel_opted ? course.hostel_fee : 0;
    const messFee = is_mess_opted ? course.mess_fee : 0;
    
    const preTaxTotal = course.discounted_course_fee - extra_discount_amount + hostelFee + messFee;
    const taxableAmount = course.discounted_course_fee - extra_discount_amount;

    let sgstAmount = 0, cgstAmount = 0, igstAmount = 0;

    if (igst_applicable) {
      igstAmount = (taxableAmount * igstRate) / 100;
    } else {
      sgstAmount = (taxableAmount * sgstRate) / 100;
      cgstAmount = (taxableAmount * cgstRate) / 100;
    }

    const totalTaxAmount = sgstAmount + cgstAmount + igstAmount;
    const totalPayableFee = preTaxTotal + totalTaxAmount;

    return {
      preTaxTotal,
      taxableAmount,
      sgstPercentage: sgstRate,
      cgstPercentage: cgstRate,
      igstPercentage: igstRate,
      sgstAmount,
      cgstAmount,
      igstAmount,
      totalTaxAmount,
      totalPayableFee
    };
  }

  async getStudentsList(filters) {
    const result = await StudentEnrollmentRepository.findStudentEnrollments(filters);
    
    const students = result.rows.map(enrollment => {
      const student = enrollment.student;
      const user = student.user;
      
      return {
        student_id: student.id,
        student_code: student.student_code,
        name: student.name_on_id,
        mobile: user.mobile,
        course: enrollment.course.title,
        course_status: enrollment.status,
        fee_status: enrollment.due_amount > 0 ? 'Due' : 'Paid',
        due_amount: enrollment.due_amount,
        login_enabled: student.login_enabled,
        enrollment_id: enrollment.id
      };
    });

    return {
      success: true,
      message: 'Students retrieved successfully',
      data: students,
      pagination: {
        page: parseInt(filters.page || 1),
        limit: parseInt(filters.limit || 10),
        total: result.count,
        totalPages: Math.ceil(result.count / (filters.limit || 10))
      }
    };
  }

  async getStudentDetails(studentId) {
    const student = await StudentEnrollmentRepository.findStudentById(studentId);
    
    if (!student) {
      throw new Error('Student not found');
    }

    return {
      success: true,
      message: 'Student details retrieved successfully',
      data: {
        student_info: {
          id: student.id,
          student_code: student.student_code,
          name: student.name_on_id,
          mobile: student.user.mobile,
          email: student.user.email,
          father_name: student.father_name,
          mother_name: student.mother_name,
          date_of_birth: student.date_of_birth,
          gender: student.gender,
          address: student.address,
          state: student.state,
          city: student.city,
          pincode: student.pincode,
          aadhar_number: student.aadhar_number,
          pan_number: student.pan_number,
          login_enabled: student.login_enabled
        },
        enrollments: student.enrollments.map(enrollment => ({
          id: enrollment.id,
          course: enrollment.course.title,
          status: enrollment.status,
          enrollment_date: enrollment.enrollment_date,
          completion_date: enrollment.completion_date,
          total_fee: enrollment.total_payable_fee,
          paid_amount: enrollment.paid_amount,
          due_amount: enrollment.due_amount
        })),
        documents: student.documents.map(doc => ({
          id: doc.id,
          type: doc.slug,
          file_name: doc.file_name,
          uploaded_at: doc.uploaded_at
        }))
      }
    };
  }

  async updateEnrollment(enrollmentId, updateData, currentUserId) {
    const enrollment = await StudentEnrollmentRepository.findEnrollmentById(enrollmentId);
    
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    const { paid_amount, payment_method, ...otherUpdates } = updateData;

    if (paid_amount !== undefined) {
      const newPaidAmount = enrollment.paid_amount + paid_amount;
      const newDueAmount = enrollment.total_payable_fee - newPaidAmount;

      otherUpdates.paid_amount = newPaidAmount;
      otherUpdates.due_amount = newDueAmount;

      if (paid_amount > 0) {
        await StudentEnrollmentRepository.createTransaction({
          type: 'income',
          category_id: 1,
          student_id: enrollment.student_id,
          course_id: enrollment.course_id,
          enrollment_id: enrollment.id,
          amount: paid_amount,
          transaction_date: new Date(),
          payment_mode: payment_method || 'cash',
          description: `Additional payment for ${enrollment.course.title}`,
          payer_name: enrollment.student.name_on_id,
          payer_contact: enrollment.student.user.mobile,
          created_by: currentUserId
        }, { currentUserId });

        await StudentEnrollmentRepository.createPayment({
          student_id: enrollment.student_id,
          course_id: enrollment.course_id,
          enrollment_id: enrollment.id,
          type: 'course_fee',
          amount: paid_amount,
          payment_date: new Date(),
          payment_method: payment_method || 'cash',
          previous_due_amount: enrollment.due_amount,
          remaining_due_amount: newDueAmount,
          created_by: currentUserId
        }, { currentUserId });
      }
    }

    await StudentEnrollmentRepository.updateEnrollment(enrollmentId, otherUpdates, currentUserId);

    return {
      success: true,
      message: 'Enrollment updated successfully'
    };
  }

  async toggleStudentLogin(studentId, loginEnabled, currentUserId) {
    await StudentEnrollmentRepository.updateStudent(studentId, { login_enabled: loginEnabled }, currentUserId);

    return {
      success: true,
      message: `Student login ${loginEnabled ? 'enabled' : 'disabled'} successfully`
    };
  }

  async uploadDocuments(studentId, documents, currentUserId) {
    const documentData = documents.map(doc => ({
      student_id: studentId,
      slug: doc.slug,
      file_path: doc.file_path,
      file_name: doc.file_name,
      created_by: currentUserId
    }));

    await StudentEnrollmentRepository.createDocuments(documentData, { currentUserId });

    return {
      success: true,
      message: 'Documents uploaded successfully'
    };
  }

  async deleteDocument(documentId, currentUserId) {
    await StudentEnrollmentRepository.deleteDocument(documentId, currentUserId);

    return {
      success: true,
      message: 'Document deleted successfully'
    };
  }

  async getCoursesList() {
    const courses = await StudentEnrollmentRepository.findAllCourses();

    return {
      success: true,
      message: 'Courses retrieved successfully',
      data: courses.map(course => ({
        id: course.id,
        title: course.title,
        base_course_fee: course.base_course_fee,
        discount_percentage: course.discount_percentage,
        discounted_course_fee: course.discounted_course_fee,
        hostel_available: course.hostel_available,
        hostel_fee: course.hostel_fee,
        mess_available: course.mess_available,
        mess_fee: course.mess_fee
      }))
    };
  }

  async getPaymentHistory(studentId, enrollmentId) {
    const payments = await StudentEnrollmentRepository.getStudentPaymentHistory(studentId, enrollmentId);

    return {
      success: true,
      message: 'Payment history retrieved successfully',
      data: payments
    };
  }

  async getCourseById(courseId) {
    const course = await StudentEnrollmentRepository.findCourseById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    return course;
  }
}

export default new StudentEnrollmentService();