import CourseService from '../../services/CourseService.js';
import { 
  successResponse, 
  errorResponse,
  paginatedResponse
} from '../../utils/responseFormatter.js';
import { STATUS_CODES } from '../../constants/messages.js';

class WebsiteCourseController {
  /**
   * Get all active courses for public display
   * @route GET /courses
   * @access Public
   */
  static async getPublicCourses(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        language = 'en',
        sortBy = 'display_order',
        sortOrder = 'ASC'
      } = req.query;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

      const filters = {
        page: pageNum,
        limit: limitNum,
        search,
        language,
        sortBy,
        sortOrder
      };

      const result = await CourseService.getPublicCourses(filters);

      return paginatedResponse(res, result.data, result.pagination, result.message);
    } catch (error) {
      console.error('Error in WebsiteCourseController.getPublicCourses:', error);
      return errorResponse(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get single course details by slug for public display
   * @route GET /courses/:slug
   * @access Public
   */
  static async getPublicCourseById(req, res) {
    try {
      const { id } = req.params;
      const result = await CourseService.getCourseById(id);

      if (!result.success) {
        return errorResponse(res, result.message, STATUS_CODES.NOT_FOUND);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in WebsiteCourseController.getPublicCourseById:', error);
      return errorResponse(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }
  static async getPublicCourseBySlug(req, res) {
    try {
      const { slug } = req.params;
      const result = await CourseService.getCourseBySlug(slug);

      if (!result.success) {
        return errorResponse(res, result.message, STATUS_CODES.NOT_FOUND);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in WebsiteCourseController.getPublicCourseBySlug:', error);
      return errorResponse(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get featured courses (courses with offer badges)
   * @route GET /courses/featured
   * @access Public
   */
  static async getFeaturedCourses(req, res) {
    try {
      const { language = 'en', limit = 6 } = req.query;
      const limitNum = Math.min(20, Math.max(1, parseInt(limit)));

      const result = await CourseService.getFeaturedCourses(language, limitNum);

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in WebsiteCourseController.getFeaturedCourses:', error);
      return errorResponse(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get course statistics for public display
   * @route GET /courses/stats
   * @access Public
   */
  static async getCourseStats(req, res) {
    try {
      const { language = 'en' } = req.query;
      const result = await CourseService.getCourseStats(language);

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in WebsiteCourseController.getCourseStats:', error);
      return errorResponse(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }
}

export default WebsiteCourseController;
