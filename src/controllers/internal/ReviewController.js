// src/controllers/internal/ReviewController.js
import ReviewService from '../../services/ReviewService.js';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  notFoundResponse,
  validationErrorResponse
} from '../../utils/responseFormatter.js';
import { 
  createReviewSchema, 
  updateReviewSchema, 
  approvalStatusSchema,
  reorderReviewsSchema,
  reviewQuerySchema 
} from '../../validations/reviewValidation.js';

class ReviewController {
  /**
   * Create a new review
   * POST /api/internal/reviews
   */
  static async createReview(req, res) {
    try {
      // Validate request body
      const { error, value } = createReviewSchema.validate(req.body);
      if (error) {
        const errors = error.details.reduce((acc, err) => {
          acc[err.path[0]] = err.message;
          return acc;
        }, {});
        return validationErrorResponse(res, errors);
      }

      const currentUserId = req.user.id;
      const result = await ReviewService.createReview(value, currentUserId);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message, 201);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get single review by ID
   * GET /api/internal/reviews/:id
   */
  static async getReviewById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return validationErrorResponse(res, { id: 'Valid review ID is required' });
      }

      const result = await ReviewService.getReviewById(parseInt(id));

      if (!result.success) {
        return notFoundResponse(res, result.message);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get all reviews with filters and pagination
   * GET /api/internal/reviews
   */
  static async getAllReviews(req, res) {
    try {
      // Validate query parameters
      const { error, value } = reviewQuerySchema.validate(req.query);
      if (error) {
        const errors = error.details.reduce((acc, err) => {
          acc[err.path[0]] = err.message;
          return acc;
        }, {});
        return validationErrorResponse(res, errors);
      }

      const filters = {
        page: value.page || 1,
        limit: value.limit || 10,
        search: value.search || '',
        is_approved: value.is_approved,
        is_enrolled_student: value.is_enrolled_student,
        rating: value.rating,
        student_id: value.student_id,
        sortBy: value.sortBy || 'display_order',
        sortOrder: value.sortOrder || 'ASC'
      };

      const result = await ReviewService.getAllReviews(filters);

      if (!result.success) {
        return errorResponse(res, result.message, 500);
      }

      return paginatedResponse(
        res,
        result.data,
        result.pagination,
        result.message
      );
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Update review
   * PUT /api/internal/reviews/:id
   */
  static async updateReview(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return validationErrorResponse(res, { id: 'Valid review ID is required' });
      }

      // Validate request body
      const { error, value } = updateReviewSchema.validate(req.body);
      if (error) {
        const errors = error.details.reduce((acc, err) => {
          acc[err.path[0]] = err.message;
          return acc;
        }, {});
        return validationErrorResponse(res, errors);
      }

      const currentUserId = req.user.id;
      const result = await ReviewService.updateReview(
        parseInt(id),
        value,
        currentUserId
      );

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Delete review (soft delete)
   * DELETE /api/internal/reviews/:id
   */
  static async deleteReview(req, res) {
    try {
      const { id } = req.params;
      const currentUserId = req.user.id;

      if (!id || isNaN(id)) {
        return validationErrorResponse(res, { id: 'Valid review ID is required' });
      }

      const result = await ReviewService.deleteReview(parseInt(id), currentUserId);

      if (!result.success) {
        return notFoundResponse(res, result.message);
      }

      return successResponse(res, null, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Change approval status of review
   * PATCH /api/internal/reviews/:id/approval-status
   */
  static async changeApprovalStatus(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return validationErrorResponse(res, { id: 'Valid review ID is required' });
      }

      // Validate request body
      const { error, value } = approvalStatusSchema.validate(req.body);
      if (error) {
        const errors = error.details.reduce((acc, err) => {
          acc[err.path[0]] = err.message;
          return acc;
        }, {});
        return validationErrorResponse(res, errors);
      }

      const currentUserId = req.user.id;
      const result = await ReviewService.changeApprovalStatus(
        parseInt(id),
        value.is_approved,
        currentUserId
      );

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Reorder reviews
   * POST /api/internal/reviews/reorder
   */
  static async reorderReviews(req, res) {
    try {
      // Validate request body
      const { error, value } = reorderReviewsSchema.validate(req.body);
      if (error) {
        const errors = error.details.reduce((acc, err) => {
          acc[err.path[0]] = err.message;
          return acc;
        }, {});
        return validationErrorResponse(res, errors);
      }

      const currentUserId = req.user.id;
      const result = await ReviewService.reorderReviews(value.reviews, currentUserId);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get review statistics
   * GET /api/internal/reviews/statistics
   */
  static async getStatistics(req, res) {
    try {
      const result = await ReviewService.getStatistics();

      if (!result.success) {
        return errorResponse(res, result.message, 500);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}

export default ReviewController;