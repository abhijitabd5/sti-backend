import CourseService from '../../services/CourseService.js';
import { 
  successResponse, 
  errorResponse,
  validationErrorResponse,
  paginatedResponse
} from '../../utils/responseFormatter.js';
import { STATUS_CODES } from '../../constants/messages.js';

class CourseController {
  /**
   * Get all courses with pagination and filtering
   * @route GET /courses
   * @access Private (Admin/Staff)
   */
  static async getAllCourses(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        is_active,
        language,
        sortBy = 'display_order',
        sortOrder = 'ASC'
      } = req.query;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

      const filters = {
        page: pageNum,
        limit: limitNum,
        search,
        is_active: is_active !== undefined ? is_active === 'true' : undefined,
        language,
        sortBy,
        sortOrder
      };

      const result = await CourseService.getAllCourses(filters, req.user.id);

      return paginatedResponse(res, result.data, result.pagination, result.message);
    } catch (error) {
      console.error('Error in CourseController.getAllCourses:', error);
      return errorResponse(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get single course by ID
   * @route GET /courses/:id
   * @access Private (Admin/Staff)
   */
  static async getCourseById(req, res) {
    try {
      const { id } = req.params;
      const result = await CourseService.getCourseById(id, req.user.id);

      if (!result.success) {
        return errorResponse(res, result.message, STATUS_CODES.NOT_FOUND);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in CourseController.getCourseById:', error);
      return errorResponse(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Create new course
   * @route POST /courses
   * @access Private (Admin/Staff with manage_courses permission)
   */
  static async createCourse(req, res) {
    try {
      const result = await CourseService.createCourse(req.body, req.user.id);

      if (!result.success) {
        if (result.errors) {
          return validationErrorResponse(res, result.errors, result.message);
        }
        return errorResponse(res, result.message, STATUS_CODES.BAD_REQUEST);
      }

      return successResponse(res, result.data, result.message, STATUS_CODES.CREATED);
    } catch (error) {
      console.error('Error in CourseController.createCourse:', error);
      return errorResponse(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update course
   * @route PUT /courses/:id
   * @access Private (Admin/Staff with manage_courses permission)
   */
  static async updateCourse(req, res) {
    try {
      const { id } = req.params;
      const result = await CourseService.updateCourse(id, req.body, req.user.id);

      if (!result.success) {
        if (result.errors) {
          return validationErrorResponse(res, result.errors, result.message);
        }
        if (result.message.includes('not found')) {
          return errorResponse(res, result.message, STATUS_CODES.NOT_FOUND);
        }
        return errorResponse(res, result.message, STATUS_CODES.BAD_REQUEST);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in CourseController.updateCourse:', error);
      return errorResponse(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Toggle course active status
   * @route PATCH /courses/:id/toggle-status
   * @access Private (Admin/Staff with manage_courses permission)
   */
  static async toggleCourseStatus(req, res) {
    try {
      const { id } = req.params;
      const result = await CourseService.toggleCourseStatus(id, req.user.id);

      if (!result.success) {
        return errorResponse(res, result.message, STATUS_CODES.NOT_FOUND);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in CourseController.toggleCourseStatus:', error);
      return errorResponse(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Delete course (soft delete)
   * @route DELETE /courses/:id
   * @access Private (Admin/Staff with manage_courses permission)
   */
  static async deleteCourse(req, res) {
    try {
      const { id } = req.params;
      const result = await CourseService.deleteCourse(id, req.user.id);

      if (!result.success) {
        return errorResponse(res, result.message, STATUS_CODES.NOT_FOUND);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in CourseController.deleteCourse:', error);
      return errorResponse(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update display order for multiple courses
   * @route PUT /courses/reorder
   * @access Private (Admin/Staff with manage_courses permission)
   */
  static async reorderCourses(req, res) {
    try {
      const { courses } = req.body;
      const result = await CourseService.reorderCourses(courses, req.user.id);

      if (!result.success) {
        if (result.errors) {
          return validationErrorResponse(res, result.errors, result.message);
        }
        return errorResponse(res, result.message, STATUS_CODES.BAD_REQUEST);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in CourseController.reorderCourses:', error);
      return errorResponse(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }
}

export default CourseController;
