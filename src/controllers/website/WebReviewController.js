// src/controllers/website/WebReviewController.js
import ReviewService from '../../services/ReviewService.js';
import {
  successResponse,
  errorResponse,
  validationErrorResponse
} from '../../utils/responseFormatter.js';
import { createReviewSchema } from '../../validations/reviewValidation.js';
import Joi from 'joi';

class WebReviewController {
  /**
   * Create a new review (Public endpoint for end users)
   * POST /api/public/reviews
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

      // For public reviews, there's no authenticated user
      // So we'll use a system user ID or null for created_by
      const systemUserId = 1; // You can configure this as a constant
      const result = await ReviewService.createReview(value, systemUserId);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      // Return success message without exposing sensitive data
      return successResponse(
        res, 
        { 
          id: result.data.id,
          message: 'Thank you for your review! It will be published after approval.' 
        }, 
        'Review submitted successfully', 
        201
      );
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get approved reviews for public display
   * GET /api/public/reviews
   */
  static async getApprovedReviews(req, res) {
    try {
      // Validate query parameters
      const querySchema = Joi.object({
        limit: Joi.number().integer().min(1).max(100).optional()
      });

      const { error, value } = querySchema.validate(req.query);
      if (error) {
        const errors = error.details.reduce((acc, err) => {
          acc[err.path[0]] = err.message;
          return acc;
        }, {});
        return validationErrorResponse(res, errors);
      }

      const limit = value.limit || 10;
      const result = await ReviewService.getApprovedReviews(parseInt(limit));

      if (!result.success) {
        return errorResponse(res, result.message, 500);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get review statistics for public display
   * GET /api/public/reviews/statistics
   */
  static async getStatistics(req, res) {
    try {
      const result = await ReviewService.getStatistics();

      if (!result.success) {
        return errorResponse(res, result.message, 500);
      }

      // Filter statistics for public view
      const publicStats = {
        totalReviews: result.data.approved,
        averageRating: result.data.averageRating
      };

      return successResponse(res, publicStats, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}

export default WebReviewController;