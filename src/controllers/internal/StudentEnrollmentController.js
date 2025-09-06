import StudentEnrollmentService from '../../services/StudentEnrollmentService.js';
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse, 
  createResponse,
  notFoundResponse 
} from '../../utils/responseFormatter.js';

class StudentEnrollmentController {
  static async checkAadharExists(req, res) {
    try {
      const { aadhar_number } = req.body;
      
      if (!aadhar_number) {
        return errorResponse(res, 'Aadhar number is required', 400);
      }

      const result = await StudentEnrollmentService.checkAadharExists(aadhar_number);
      return successResponse(res, result, 'Aadhar check completed');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async createEnrollment(req, res) {
    try {
      const enrollmentData = req.body;
      const currentUserId = req.user.id;

      const result = await StudentEnrollmentService.createNewEnrollment(enrollmentData, currentUserId);
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
        course: req.query.course
      };

      const result = await StudentEnrollmentService.getStudentsList(filters);
      return paginatedResponse(res, result.data, result.pagination, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getStudentDetails(req, res) {
    try {
      const { studentId } = req.params;
      const result = await StudentEnrollmentService.getStudentDetails(studentId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message === 'Student not found') {
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

      const result = await StudentEnrollmentService.updateEnrollment(enrollmentId, updateData, currentUserId);
      return successResponse(res, null, result.message);
    } catch (error) {
      if (error.message === 'Enrollment not found') {
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

      const result = await StudentEnrollmentService.toggleStudentLogin(studentId, login_enabled, currentUserId);
      return successResponse(res, null, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async uploadDocuments(req, res) {
    try {
      const { studentId } = req.params;
      const { documents } = req.body;
      const currentUserId = req.user.id;

      const result = await StudentEnrollmentService.uploadDocuments(studentId, documents, currentUserId);
      return successResponse(res, null, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async deleteDocument(req, res) {
    try {
      const { documentId } = req.params;
      const currentUserId = req.user.id;

      const result = await StudentEnrollmentService.deleteDocument(documentId, currentUserId);
      return successResponse(res, null, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getCoursesList(req, res) {
    try {
      const result = await StudentEnrollmentService.getCoursesList();
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getPaymentHistory(req, res) {
    try {
      const { studentId, enrollmentId } = req.params;
      const result = await StudentEnrollmentService.getPaymentHistory(studentId, enrollmentId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async calculateFees(req, res) {
    try {
      const { course_id, extra_discount_amount, is_hostel_opted, is_mess_opted, igst_applicable } = req.body;
      
      const course = await StudentEnrollmentService.getCourseById(course_id);
      
      const feeCalculation = StudentEnrollmentService.calculateFees(course, {
        extra_discount_amount: extra_discount_amount || 0,
        is_hostel_opted: is_hostel_opted || false,
        is_mess_opted: is_mess_opted || false,
        igst_applicable: igst_applicable || false
      });

      return successResponse(res, feeCalculation, 'Fee calculation completed');
    } catch (error) {
      if (error.message === 'Course not found') {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 500);
    }
  }
}

export default StudentEnrollmentController;