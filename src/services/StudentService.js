import StudentRepository from "../repositories/StudentRepository.js";
import { hashPassword } from "../utils/bcrypt.js";
import { Op } from "sequelize";
import { sequelize } from "../models/index.js";
import slugify from "../utils/slugify.js";
import fs from "fs/promises";
import path from "path";

class StudentService {
  async checkAadharExists(aadharNumber) {
    const student = await StudentRepository.findUserByAadhar(aadharNumber);

    if (student) {
      return {
        exists: true,
        student: {
          id: student.id,
          student_code: student.student_code,
          name: student.name_on_id,
          mobile: student.user?.mobile,
          email: student.user?.email,
          enrollments: student.enrollments || [],
        },
      };
    }

    return { exists: false };
  }

  async createNewEnrollment(enrollmentData, currentUserId) {
    const transaction = await sequelize.transaction();

    try {
      const {
        aadhar_number,
        name_on_id,
        father_name,
        mother_name,
        date_of_birth,
        gender,
        address,
        state,
        city,
        pincode,
        mobile,
        email,
        course_id,
        enrollment_date,
        status,
        extra_discount_amount,
        is_hostel_opted,
        is_mess_opted,
        paid_amount,
        payment_method,
        documents,
        remark,
        igst_applicable,
      } = enrollmentData;

      const course = await StudentRepository.findCourseById(course_id);
      if (!course) throw new Error("Course not found");

      const student = await StudentRepository.findUserByAadhar(aadhar_number);
      let user, studentRecord;

      if (!student) {
        const existingUser = await StudentRepository.findUserByMobile(mobile);
        if (existingUser && existingUser.student) {
          throw new Error("Mobile number already registered with another student");
        }

        const hashedPassword = await hashPassword(mobile);

        user = await StudentRepository.createUser(
          {
            first_name: name_on_id.split(" ")[0],
            last_name: name_on_id.split(" ").slice(1).join(" "),
            mobile,
            email: email || null,
            password: hashedPassword,
            role: "student",
            created_by: currentUserId,
          },
          { transaction, currentUserId }
        );

        const studentCode = await this.generateStudentCode();

        studentRecord = await StudentRepository.createStudent(
          {
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
            created_by: currentUserId,
          },
          { transaction, currentUserId }
        );
      } else {
        studentRecord = student;
        user = student.user;
      }

      const feeCalculation = this.calculateFees(course, {
        extra_discount_amount: extra_discount_amount || 0,
        is_hostel_opted: is_hostel_opted || false,
        is_mess_opted: is_mess_opted || false,
        igst_applicable: igst_applicable || false,
      });

      const enrollment = await StudentRepository.createEnrollment(
        {
          student_id: studentRecord.id,
          course_id,
          status: status || "not_started",
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
          created_by: currentUserId,
        },
        { transaction, currentUserId }
      );

      if (paid_amount && paid_amount > 0) {
        await StudentRepository.createTransaction(
          {
            type: "income",
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
            created_by: currentUserId,
          },
          { transaction, currentUserId }
        );

        await StudentRepository.createPayment(
          {
            student_id: studentRecord.id,
            course_id,
            enrollment_id: enrollment.id,
            type: "course_fee",
            amount: paid_amount,
            payment_date: enrollment_date,
            payment_method,
            previous_due_amount: feeCalculation.totalPayableFee,
            remaining_due_amount: feeCalculation.totalPayableFee - paid_amount,
            created_by: currentUserId,
          },
          { transaction, currentUserId }
        );
      }

      // if (documents && documents.length > 0) {
      //   const documentData = documents.map((doc) => ({
      //     student_id: studentRecord.id,
      //     slug: doc.slug,
      //     file_path: doc.file_path,
      //     file_name: doc.file_name,
      //     created_by: currentUserId,
      //   }));

      //   await StudentRepository.createDocuments(documentData, {
      //     transaction,
      //     currentUserId,
      //   });
      // }

      await transaction.commit();

      return {
        success: true,
        message: "Student enrolled successfully",
        data: {
          enrollment_id: enrollment.id,
          student_id: studentRecord.id,
          student_code: studentRecord.student_code,
          total_fee: feeCalculation.totalPayableFee,
          paid_amount: paid_amount || 0,
          due_amount: feeCalculation.totalPayableFee - (paid_amount || 0),
        },
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

    // 🔑 Convert all DB DECIMAL string values into numbers
    const discountedCourseFee = Number(course.discounted_course_fee) || 0;
    const hostelFee = is_hostel_opted ? Number(course.hostel_fee) || 0 : 0;
    const messFee = is_mess_opted ? Number(course.mess_fee) || 0 : 0;

    const preTaxTotal = discountedCourseFee - (extra_discount_amount || 0) + hostelFee + messFee;

    const taxableAmount = discountedCourseFee - (extra_discount_amount || 0);

    let sgstAmount = 0,
      cgstAmount = 0,
      igstAmount = 0;

    if (igst_applicable) {
      igstAmount = (taxableAmount * igstRate) / 100;
    } else {
      sgstAmount = (taxableAmount * sgstRate) / 100;
      cgstAmount = (taxableAmount * cgstRate) / 100;
    }

    const totalTaxAmount = sgstAmount + cgstAmount + igstAmount;
    const totalPayableFee = preTaxTotal + totalTaxAmount;

    // Ensure all returned values are numeric with 2 decimals
    return {
      preTaxTotal: Number(preTaxTotal.toFixed(2)),
      taxableAmount: Number(taxableAmount.toFixed(2)),
      sgstPercentage: sgstRate,
      cgstPercentage: cgstRate,
      igstPercentage: igstRate,
      sgstAmount: Number(sgstAmount.toFixed(2)),
      cgstAmount: Number(cgstAmount.toFixed(2)),
      igstAmount: Number(igstAmount.toFixed(2)),
      totalTaxAmount: Number(totalTaxAmount.toFixed(2)),
      totalPayableFee: Number(totalPayableFee.toFixed(2)),
    };
  }

  async getStudentsList(filters) {
    const result = await StudentRepository.findStudentEnrollments(filters);

    // Group enrollments by student_id
    const studentEnrollmentsMap = new Map();

    result.rows.forEach((enrollment) => {
      const student = enrollment.student;
      const user = student.user;
      const studentId = student.id;

      if (!studentEnrollmentsMap.has(studentId)) {
        studentEnrollmentsMap.set(studentId, {
          student_id: student.id,
          student_code: student.student_code,
          name: student.name_on_id,
          mobile: user.mobile,
          courses: [],
          total_due_amount: 0,
          login_enabled: student.login_enabled,
          enrollment_ids: [],
        });
      }

      const studentData = studentEnrollmentsMap.get(studentId);

      // Add course information
      studentData.courses.push({
        title: enrollment.course.title,
        status: enrollment.status,
      });

      // Add to total due amount
      studentData.total_due_amount += parseFloat(enrollment.due_amount || 0);

      // Collect enrollment IDs
      studentData.enrollment_ids.push(enrollment.id);
    });

    // Convert map to array and format final response
    const students = Array.from(studentEnrollmentsMap.values()).map((student) => ({
      student_id: student.student_id,
      student_code: student.student_code,
      name: student.name,
      mobile: student.mobile,
      courses: student.courses, // Array of {title, status}
      fee_status: student.total_due_amount > 0 ? "Due" : "Paid",
      total_due_amount: parseFloat(student.total_due_amount.toFixed(2)),
      login_enabled: student.login_enabled,
      enrollment_ids: student.enrollment_ids,
    }));

    return {
      count: students.length,
      rows: students,
    };
  }

  async getStudentsList(filters) {
    const result = await StudentRepository.findStudentEnrollments(filters);

    // Group enrollments by student_id
    const studentEnrollmentsMap = new Map();

    result.rows.forEach((enrollment) => {
      const student = enrollment.student;
      const user = student.user;
      const studentId = student.id;

      if (!studentEnrollmentsMap.has(studentId)) {
        studentEnrollmentsMap.set(studentId, {
          student_id: student.id,
          student_code: student.student_code,
          name: student.name_on_id,
          mobile: user.mobile,
          courses: [], // Changed to courses (plural) array of objects
          total_due_amount: 0,
          login_enabled: student.login_enabled,
          enrollment_id: enrollment.id, // Keep first enrollment ID
        });
      }

      const studentData = studentEnrollmentsMap.get(studentId);

      // Add course object with title and status
      studentData.courses.push({
        title: enrollment.course.title,
        status: enrollment.status,
      });

      // Add to total due amount
      studentData.total_due_amount += parseFloat(enrollment.due_amount || 0);
    });

    // Convert map to array and format for response
    const students = Array.from(studentEnrollmentsMap.values()).map((student) => ({
      student_id: student.student_id,
      student_code: student.student_code,
      name: student.name,
      mobile: student.mobile,
      courses: student.courses, // Array of {title, status} objects
      fee_status: student.total_due_amount > 0 ? "Due" : "Paid",
      due_amount: student.total_due_amount.toFixed(2),
      login_enabled: student.login_enabled,
      enrollment_id: student.enrollment_id,
    }));

    // Apply pagination to grouped results
    const page = parseInt(filters.page || 1);
    const limit = parseInt(filters.limit || 10);
    const offset = (page - 1) * limit;

    const paginatedStudents = students.slice(offset, offset + limit);
    const totalStudents = students.length;

    return {
      success: true,
      message: "Students retrieved successfully",
      data: paginatedStudents,
      pagination: {
        page: page,
        limit: limit,
        total: totalStudents,
        totalPages: Math.ceil(totalStudents / limit),
        hasNext: page < Math.ceil(totalStudents / limit),
        hasPrev: page > 1,
      },
    };
  }

  // async getStudentsList(filters) {
  //   const result = await StudentRepository.findStudentEnrollments(
  //     filters
  //   );

  //   const students = result.rows.map((enrollment) => {
  //     const student = enrollment.student;
  //     const user = student.user;

  //     return {
  //       student_id: student.id,
  //       student_code: student.student_code,
  //       name: student.name_on_id,
  //       mobile: user.mobile,
  //       course: enrollment.course.title,
  //       course_status: enrollment.status,
  //       fee_status: enrollment.due_amount > 0 ? "Due" : "Paid",
  //       due_amount: enrollment.due_amount,
  //       login_enabled: student.login_enabled,
  //       enrollment_id: enrollment.id,
  //     };
  //   });

  // return {
  //   success: true,
  //   message: "Students retrieved successfully",
  //   data: students,
  //   pagination: {
  //     page: parseInt(filters.page || 1),
  //     limit: parseInt(filters.limit || 10),
  //     total: result.count,
  //     totalPages: Math.ceil(result.count / (filters.limit || 10)),
  //   },
  // };
  // }

  async getStudentDetails(studentId) {
    const student = await StudentRepository.findStudentById(studentId);

    if (!student) {
      throw new Error("Student not found");
    }

    return {
      success: true,
      message: "Student details retrieved successfully",
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
          login_enabled: student.login_enabled,
        },
        enrollments: student.enrollments.map((enrollment) => ({
          id: enrollment.id,
          course: enrollment.course.title,
          status: enrollment.status,
          enrollment_date: enrollment.enrollment_date,
          completion_date: enrollment.completion_date,
          total_fee: enrollment.total_payable_fee,
          paid_amount: enrollment.paid_amount,
          due_amount: enrollment.due_amount,
        })),
        documents: student.documents.map((doc) => ({
          id: doc.id,
          type: doc.slug,
          file_name: doc.file_name,
          file_url: process.env.BASE_URL + doc.file_path,
          is_verified: doc.is_verified,
          uploaded_at: doc.uploaded_at,
        })),
      },
    };
  }

  async updateEnrollment(enrollmentId, updateData, currentUserId) {
    const enrollment = await StudentRepository.findEnrollmentById(enrollmentId);

    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    const { paid_amount, payment_method, ...otherUpdates } = updateData;

    if (paid_amount !== undefined) {
      const newPaidAmount = enrollment.paid_amount + paid_amount;
      const newDueAmount = enrollment.total_payable_fee - newPaidAmount;

      otherUpdates.paid_amount = newPaidAmount;
      otherUpdates.due_amount = newDueAmount;

      if (paid_amount > 0) {
        await StudentRepository.createTransaction(
          {
            type: "income",
            category_id: 1,
            student_id: enrollment.student_id,
            course_id: enrollment.course_id,
            enrollment_id: enrollment.id,
            amount: paid_amount,
            transaction_date: new Date(),
            payment_mode: payment_method || "cash",
            description: `Additional payment for ${enrollment.course.title}`,
            payer_name: enrollment.student.name_on_id,
            payer_contact: enrollment.student.user.mobile,
            created_by: currentUserId,
          },
          { currentUserId }
        );

        await StudentRepository.createPayment(
          {
            student_id: enrollment.student_id,
            course_id: enrollment.course_id,
            enrollment_id: enrollment.id,
            type: "course_fee",
            amount: paid_amount,
            payment_date: new Date(),
            payment_method: payment_method || "cash",
            previous_due_amount: enrollment.due_amount,
            remaining_due_amount: newDueAmount,
            created_by: currentUserId,
          },
          { currentUserId }
        );
      }
    }

    await StudentRepository.updateEnrollment(enrollmentId, otherUpdates, currentUserId);

    return {
      success: true,
      message: "Enrollment updated successfully",
    };
  }

  async toggleStudentLogin(studentId, loginEnabled, currentUserId) {
    await StudentRepository.updateStudent(studentId, { login_enabled: loginEnabled }, currentUserId);

    return {
      success: true,
      message: `Student login ${loginEnabled ? "enabled" : "disabled"} successfully`,
    };
  }

  async uploadDocuments(studentId, fileSlugMapping, files, currentUserId, additionalData = {}) {
    try {
      const studentExists = await StudentRepository.findStudentById(studentId);
      if (!studentExists) {
        throw new Error(`Student with ID ${studentId} not found`);
      }
      const uniqueSlugs = [...new Set(fileSlugMapping.map((mapping) => mapping.slug))];

      const documentData = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const slugMapping = fileSlugMapping.find((mapping) => mapping.fileIndex === i);

        if (!slugMapping) {
          throw new Error(`No slug mapping found for file at index ${i}`);
        }

        try {
          await fs.access(file.path);
        } catch (accessError) {
          throw new Error(`File ${file.originalname} was not saved properly`);
        }

        const relativePath = `uploads/students/${studentId}/${file.filename}`;

        const docData = {
          student_id: parseInt(studentId),
          document_type_slug: slugMapping.slug,
          file_path: relativePath,
          file_name: file.originalname,
          saved_filename: file.filename,
          file_size: file.size,
          mime_type: file.mimetype,
          created_by: currentUserId,
          ...additionalData,
        };

        documentData.push(docData);
      }

      const savedDocuments = await StudentRepository.createDocuments(documentData, {
        currentUserId,
      });

      return {
        success: true,
        message: `${files.length} document(s) uploaded successfully`,
        data: {
          savedDocuments,
          uploadCount: files.length,
          uploadPath: `uploads/students/${studentId}/`,
        },
      };
    } catch (error) {
      // Clean up uploaded files if database save fails
      try {
        for (const file of files) {
          if (file.path) {
            await fs.unlink(file.path);
          }
        }
      } catch (cleanupError) {
        // Silently handle cleanup errors
      }

      throw new Error(`Failed to upload documents: ${error.message}`);
    }
  }

  // async uploadDocuments(studentId, slug, files, currentUserId, additionalData = {}) {
  //   try {
  //     console.log('Files:');

  //     // Define upload directory for this student
  //     const uploadDir = path.join(process.cwd(), 'uploads', 'students', studentId);

  //     // Ensure upload directory exists
  //     await fs.mkdir(uploadDir, { recursive: true });

  //     const documentData = [];

  //     for (let i = 0; i < files.length; i++) {
  //       const file = files[i];

  //       // Generate new filename using helper function
  //       const newFileName = `test-document.pdf`;
  //       const filePath = path.join(uploadDir, newFileName);

  //       // Move file to destination
  //       await file.mv(filePath);

  //       // Prepare document data for database
  //       const docData = {
  //         student_id: studentId,
  //         slug: slug, // Document type slug from request body
  //         file_path: `uploads/students/${studentId}/${newFileName}`,
  //         file_name: file.name, // Original filename
  //       };

  //       documentData.push(docData);
  //     }

  //     // Save to database
  //     const savedDocuments = await StudentRepository.createDocuments(documentData, {
  //       currentUserId,
  //     });

  //     return {
  //       success: true,
  //       message: `${files.length} document(s) uploaded successfully`,
  //       data: savedDocuments
  //     };

  //   } catch (error) {
  //     console.error('Service upload error:', error);
  //     throw new Error(`Failed to upload documents: ${error.message}`);
  //   }
  // }

  async deleteDocument(documentId, currentUserId) {
    await StudentRepository.deleteDocument(documentId, currentUserId);

    return {
      success: true,
      message: "Document deleted successfully",
    };
  }

  async getCoursesList() {
    const courses = await StudentRepository.findAllCourses();

    return {
      success: true,
      message: "Courses retrieved successfully",
      data: courses.map((course) => ({
        id: course.id,
        title: course.title,
        base_course_fee: course.base_course_fee,
        discount_percentage: course.discount_percentage,
        discounted_course_fee: course.discounted_course_fee,
        hostel_available: course.hostel_available,
        hostel_fee: course.hostel_fee,
        mess_available: course.mess_available,
        mess_fee: course.mess_fee,
      })),
    };
  }

  async getPaymentHistory(studentId, enrollmentId = null) {
    // If enrollmentId is provided, validate it belongs to the student
    if (enrollmentId) {
      const isValidEnrollment = await StudentRepository.validateStudentEnrollment(studentId, enrollmentId);

      if (!isValidEnrollment) {
        throw new Error("Enrollment not found or does not belong to this student");
      }
    }

    const payments = await StudentRepository.getStudentPaymentHistory(studentId, enrollmentId);

    const message = enrollmentId
      ? "Payment history for enrollment retrieved successfully"
      : "Payment history for student retrieved successfully";

    return {
      success: true,
      message,
      data: payments,
    };
  }

  async getCourseById(courseId) {
    const course = await StudentRepository.findCourseById(courseId);
    if (!course) {
      throw new Error("Course not found");
    }
    return course;
  }

  async generateStudentCode() {
    const prefix = "STI";
    const currentYear = new Date().getFullYear();

    // fetch last student (including soft-deleted)
    const lastStudent = await StudentRepository.findLastStudent();

    if (!lastStudent || !lastStudent.student_code) {
      // first student
      return `${prefix}${currentYear}00001`;
    }

    const lastCode = lastStudent.student_code; // e.g. "STI202400123"
    const yearPart = parseInt(lastCode.substring(3, 7));
    const numberPart = parseInt(lastCode.substring(7));

    if (yearPart === currentYear) {
      // same year → increment counter
      const newCounter = (numberPart + 1).toString().padStart(5, "0");
      return `${prefix}${currentYear}${newCounter}`;
    } else {
      // new year → reset counter
      return `${prefix}${currentYear}00001`;
    }
  }

  calculateFeesOld(course, options) {
    const { extra_discount_amount, is_hostel_opted, is_mess_opted, igst_applicable } = options;

    const sgstRate = parseFloat(process.env.SGST_PERCENTAGE || 9);
    const cgstRate = parseFloat(process.env.CGST_PERCENTAGE || 9);
    const igstRate = parseFloat(process.env.IGST_PERCENTAGE || 18);

    const hostelFee = is_hostel_opted ? course.hostel_fee : 0;
    const messFee = is_mess_opted ? course.mess_fee : 0;

    const preTaxTotal = course.discounted_course_fee - extra_discount_amount + hostelFee + messFee;
    const taxableAmount = course.discounted_course_fee - extra_discount_amount;

    let sgstAmount = 0,
      cgstAmount = 0,
      igstAmount = 0;

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
      totalPayableFee,
    };
  }
}

export default new StudentService();
