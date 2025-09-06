// src/controllers/internal/CourseController.js

import CourseService from '../../services/CourseService.js';
import { 
  successResponse, 
  errorResponse,
  validationErrorResponse,
  paginatedResponse
} from '../../utils/responseFormatter.js';

class CourseController {

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

      return paginatedResponse(res, result.data, result.pagination, result.message, 200);
    } catch (error) {
      console.error('Error in CourseController.getAllCourses:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async getCourseById(req, res) {
    try {
      const { id } = req.params;
      const result = await CourseService.getCourseById(id, req.user.id);

      if (!result.success) {
        return errorResponse(res, result.message, 404);
      }

      return successResponse(res, result.data, result.message, 200);
    } catch (error) {
      console.error('Error in CourseController.getCourseById:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async createCourse(req, res) {
    try {
      const result = await CourseService.createCourse(req.body, req.user.id);

      if (!result.success) {
        if (result.errors) {
          return validationErrorResponse(res, result.errors, result.message, 400);
        }
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message, 201);
    } catch (error) {
      console.error('Error in CourseController.createCourse:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async updateCourse(req, res) {
    try {
      const { id } = req.params;
      const result = await CourseService.updateCourse(id, req.body, req.user.id);

      if (!result.success) {
        if (result.errors) {
          return validationErrorResponse(res, result.errors, result.message, 400);
        }
        if (result.message.includes('not found')) {
          return errorResponse(res, result.message, 404);
        }
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message, 200);
    } catch (error) {
      console.error('Error in CourseController.updateCourse:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async toggleCourseStatus(req, res) {
    try {
      const { id } = req.params;
      const result = await CourseService.toggleCourseStatus(id, req.user.id);

      if (!result.success) {
        return errorResponse(res, result.message, 404);
      }

      return successResponse(res, result.data, result.message, 200);
    } catch (error) {
      console.error('Error in CourseController.toggleCourseStatus:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async deleteCourse(req, res) {
    try {
      const { id } = req.params;
      const result = await CourseService.deleteCourse(id, req.user.id);

      if (!result.success) {
        return errorResponse(res, result.message, 404);
      }

      return successResponse(res, result.data, result.message, 200);
    } catch (error) {
      console.error('Error in CourseController.deleteCourse:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async reorderCourses(req, res) {
    try {
      const { courses } = req.body;
      const result = await CourseService.reorderCourses(courses, req.user.id);

      if (!result.success) {
        if (result.errors) {
          return validationErrorResponse(res, result.errors, result.message, 400);
        }
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message, 200);
    } catch (error) {
      console.error('Error in CourseController.reorderCourses:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

export default CourseController;