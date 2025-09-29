import StudentService from "../../services/StudentService.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  createResponse,
  notFoundResponse,
} from "../../utils/responseFormatter.js";
import multer from "multer";

class StudentController {
  static async checkAadharExists(req, res) {
    try {
      const { aadhar_number } = req.body;

      if (!aadhar_number) {
        return errorResponse(res, "Aadhar number is required", 400);
      }

      const result = await StudentService.checkAadharExists(aadhar_number);
      return successResponse(res, result, "Aadhar check completed");
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async createEnrollment(req, res) {
    console.log("Reached inside controller");
    try {
      const enrollmentData = req.body;
      const currentUserId = req.user.id;

      const result = await StudentService.createNewEnrollment(enrollmentData, currentUserId);
      return createResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getStudentsList(req, res) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        status: req.query.status,
        course: req.query.course,
      };

      const result = await StudentService.getStudentsList(filters);
      return paginatedResponse(res, result.data, result.pagination, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getStudentDetails(req, res) {
    try {
      const { studentId } = req.params;
      const result = await StudentService.getStudentDetails(studentId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message === "Student not found") {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 500);
    }
  }

  static async updateEnrollment(req, res) {
    try {
      const { enrollmentId } = req.params;
      const updateData = req.body;
      const currentUserId = req.user.id;

      const result = await StudentService.updateEnrollment(enrollmentId, updateData, currentUserId);
      return successResponse(res, null, result.message);
    } catch (error) {
      if (error.message === "Enrollment not found") {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 500);
    }
  }

  static async toggleStudentLogin(req, res) {
    try {
      const { studentId } = req.params;
      const { login_enabled } = req.body;
      const currentUserId = req.user.id;

      const result = await StudentService.toggleStudentLogin(studentId, login_enabled, currentUserId);
      return successResponse(res, null, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async uploadDocuments(req, res) {
    try {
      const { studentId } = req.params;
      const currentUserId = req.user.id;

      // Check if files were uploaded
      if (!req.files || req.files.length === 0) {
        return errorResponse(res, "No files were uploaded", 400);
      }

      // Handle multiple approaches for slugs
      let fileSlugMapping = [];

      if (req.body.slug) {
        // Single slug for all files
        fileSlugMapping = req.files.map((_, index) => ({
          fileIndex: index,
          slug: req.body.slug,
        }));
      } else if (req.body.slugs) {
        // Multiple slugs as JSON string or array
        const slugsArray = typeof req.body.slugs === "string" ? JSON.parse(req.body.slugs) : req.body.slugs;

        fileSlugMapping = req.files.map((_, index) => ({
          fileIndex: index,
          slug: slugsArray[index] || slugsArray[0],
        }));
      } else {
        // Individual slug for each file
        fileSlugMapping = req.files.map((_, index) => {
          const slugKey = `file-${index}-slug`;
          const slug = req.body[slugKey];

          if (!slug) {
            throw new Error(`Slug missing for file at index ${index}. Expected field: ${slugKey}`);
          }

          return {
            fileIndex: index,
            slug: slug,
          };
        });
      }

      // Validate that all files have slugs
      const missingSlugs = fileSlugMapping.filter((mapping) => !mapping.slug);
      if (missingSlugs.length > 0) {
        return errorResponse(res, "All files must have associated document type slugs", 400);
      }

      // Extract additional data from request body
      const additionalData = { ...req.body };
      delete additionalData.slug;
      delete additionalData.slugs;
      Object.keys(additionalData).forEach((key) => {
        if (key.startsWith("file-") && key.endsWith("-slug")) {
          delete additionalData[key];
        }
      });

      const result = await StudentService.uploadDocuments(
        studentId,
        fileSlugMapping,
        req.files,
        currentUserId,
        additionalData
      );

      return successResponse(res, result.data, result.message);
    } catch (error) {
      // Handle multer-specific errors
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return errorResponse(res, "File size too large. Maximum size is 50MB per file.", 400);
        }
        if (error.code === "LIMIT_FILE_COUNT") {
          return errorResponse(res, "Too many files. Maximum 10 files allowed.", 400);
        }
        if (error.code === "UNEXPECTED_FILE") {
          return errorResponse(res, 'Unexpected file field. Use "documents" as the field name.', 400);
        }
      }

      return errorResponse(res, error.message, 500);
    }
  }

  // static async uploadDocuments(req, res) {
  //   try {
  //     const { studentId } = req.params;
  //     const { slug } = req.body; // Document type slug from request body
  //     const currentUserId = req.user.id;
  //       console.log('Files:',req.files);
  //       // Check if files were uploaded
  //       if (!req.files || Object.keys(req.files).length === 0) {
  //         return errorResponse(res, 'No files were uploaded', 400);
  //       }

  //     // Check if slug is provided
  //     if (!slug) {
  //       return errorResponse(res, 'Document type slug is required', 400);
  //     }

  //     // Handle both single file and multiple files
  //     const uploadedFiles = req.files.documents;
  //     const filesArray = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles];

  //     // Extract additional data from request body (optional)
  //     const additionalData = req.body;

  //     const result = await StudentService.uploadDocuments(
  //       studentId,
  //       slug,
  //       filesArray,
  //       currentUserId,
  //       additionalData
  //     );

  //     return successResponse(res, result.data, result.message);
  //   } catch (error) {
  //     console.error('Upload error:', error);
  //     return errorResponse(res, error.message, 500);
  //   }
  // }

  static async deleteDocument(req, res) {
    try {
      const { documentId } = req.params;
      const currentUserId = req.user.id;

      const result = await StudentService.deleteDocument(documentId, currentUserId);
      return successResponse(res, null, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getCoursesList(req, res) {
    try {
      const result = await StudentService.getCoursesList();
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getPaymentHistory(req, res) {
    try {
      const { studentId } = req.params;
      const { enrollmentId } = req.query;

      const result = await StudentService.getPaymentHistory(studentId, enrollmentId || null);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async calculateFees(req, res) {
    try {
      const { course_id, extra_discount_amount, is_hostel_opted, is_mess_opted, igst_applicable } = req.body;

      const course = await StudentService.getCourseById(course_id);

      const feeCalculation = StudentService.calculateFees(course, {
        extra_discount_amount: extra_discount_amount || 0,
        is_hostel_opted: is_hostel_opted || false,
        is_mess_opted: is_mess_opted || false,
        igst_applicable: igst_applicable || false,
      });

      return successResponse(res, feeCalculation, "Fee calculation completed");
    } catch (error) {
      if (error.message === "Course not found") {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 500);
    }
  }
}

export default StudentController;
