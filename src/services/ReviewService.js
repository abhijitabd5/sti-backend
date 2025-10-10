// src/services/ReviewService.js
import ReviewRepository from '../repositories/ReviewRepository.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants/messages.js';

class ReviewService {
  /**
   * Create a new review
   * @param {Object} reviewData - Review data
   * @param {Number} currentUserId - User creating the review
   * @returns {Promise<Object>} Service response
   */
  async createReview(reviewData, currentUserId) {
    try {
      // Validate rating
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        return {
          success: false,
          message: 'Rating must be between 1 and 5',
          data: null
        };
      }

      // Set defaults
      const reviewToCreate = {
        ...reviewData,
        is_approved: false,
        display_order: 0,
        created_by: currentUserId
      };

      // Generate QR code URL if not provided
      if (!reviewToCreate.qr_code_url) {
        reviewToCreate.qr_code_url = this.generateQRCodeUrl(reviewData.name, reviewData.phone);
      }

      const review = await ReviewRepository.create(reviewToCreate, currentUserId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.REVIEW_CREATED,
        data: review
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
        data: null
      };
    }
  }

  /**
   * Get review by ID
   * @param {Number} id - Review ID
   * @returns {Promise<Object>} Service response
   */
  async getReviewById(id) {
    try {
      const review = await ReviewRepository.findById(id);

      if (!review) {
        return {
          success: false,
          message: ERROR_MESSAGES.REVIEW_NOT_FOUND,
          data: null
        };
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.REVIEW_RETRIEVED,
        data: review
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
        data: null
      };
    }
  }

  /**
   * Get all reviews with filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Object>} Service response with pagination
   */
  async getAllReviews(filters) {
    try {
      const result = await ReviewRepository.findAll(filters);

      return {
        success: true,
        message: SUCCESS_MESSAGES.REVIEWS_RETRIEVED,
        data: result.reviews,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrev: result.page > 1
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
        data: null
      };
    }
  }

  /**
   * Update review
   * @param {Number} id - Review ID
   * @param {Object} updateData - Data to update
   * @param {Number} currentUserId - User making the update
   * @returns {Promise<Object>} Service response
   */
  async updateReview(id, updateData, currentUserId) {
    try {
      // Check if review exists
      const exists = await ReviewRepository.exists(id);
      if (!exists) {
        return {
          success: false,
          message: ERROR_MESSAGES.REVIEW_NOT_FOUND,
          data: null
        };
      }

      // Validate rating if provided
      if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
        return {
          success: false,
          message: 'Rating must be between 1 and 5',
          data: null
        };
      }

      // Validate display_order logic
      if (updateData.display_order !== undefined) {
        const review = await ReviewRepository.findById(id);
        if (!review.is_approved && updateData.display_order > 0) {
          return {
            success: false,
            message: 'Display order can only be set for approved reviews',
            data: null
          };
        }
      }

      const updatedReview = await ReviewRepository.update(id, updateData, currentUserId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.REVIEW_UPDATED,
        data: updatedReview
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
        data: null
      };
    }
  }

  /**
   * Delete review (soft delete)
   * @param {Number} id - Review ID
   * @param {Number} currentUserId - User deleting the review
   * @returns {Promise<Object>} Service response
   */
  async deleteReview(id, currentUserId) {
    try {
      const exists = await ReviewRepository.exists(id);
      if (!exists) {
        return {
          success: false,
          message: ERROR_MESSAGES.REVIEW_NOT_FOUND,
          data: null
        };
      }

      await ReviewRepository.softDelete(id, currentUserId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.REVIEW_DELETED,
        data: null
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
        data: null
      };
    }
  }

  /**
   * Change approval status of review
   * @param {Number} id - Review ID
   * @param {Boolean} isApproved - New approval status
   * @param {Number} currentUserId - User changing the status
   * @returns {Promise<Object>} Service response
   */
  async changeApprovalStatus(id, isApproved, currentUserId) {
    try {
      const exists = await ReviewRepository.exists(id);
      if (!exists) {
        return {
          success: false,
          message: ERROR_MESSAGES.REVIEW_NOT_FOUND,
          data: null
        };
      }

      const updatedReview = await ReviewRepository.changeApprovalStatus(
        id,
        isApproved,
        currentUserId
      );

      const statusText = isApproved ? 'approved' : 'disapproved';
      
      return {
        success: true,
        message: `Review ${statusText} successfully`,
        data: updatedReview
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
        data: null
      };
    }
  }

  /**
   * Reorder reviews
   * @param {Array} reviewsData - Array of {id, display_order}
   * @param {Number} currentUserId - User performing reorder
   * @returns {Promise<Object>} Service response
   */
  async reorderReviews(reviewsData, currentUserId) {
    try {
      // Validate all reviews exist and are approved
      for (const item of reviewsData) {
        const review = await ReviewRepository.findById(item.id);
        
        if (!review) {
          return {
            success: false,
            message: `Review with ID ${item.id} not found`,
            data: null
          };
        }

        if (!review.is_approved) {
          return {
            success: false,
            message: `Review with ID ${item.id} is not approved. Only approved reviews can be reordered.`,
            data: null
          };
        }
      }

      const updatedReviews = await ReviewRepository.reorder(reviewsData, currentUserId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.REVIEWS_REORDERED,
        data: updatedReviews
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
        data: null
      };
    }
  }

  /**
   * Get approved reviews for public display
   * @param {Number} limit - Number of reviews to fetch
   * @returns {Promise<Object>} Service response
   */
  async getApprovedReviews(limit = 10) {
    try {
      const reviews = await ReviewRepository.getApprovedReviews(limit);

      return {
        success: true,
        message: SUCCESS_MESSAGES.REVIEWS_RETRIEVED,
        data: reviews
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
        data: null
      };
    }
  }

  /**
   * Get review statistics
   * @returns {Promise<Object>} Service response
   */
  async getStatistics() {
    try {
      const stats = await ReviewRepository.getStatistics();

      return {
        success: true,
        message: SUCCESS_MESSAGES.STATISTICS_RETRIEVED,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
        data: null
      };
    }
  }

  /**
   * Generate QR code URL
   * @param {String} name - Reviewer name
   * @param {String} phone - Reviewer phone
   * @returns {String} QR code URL
   */
  generateQRCodeUrl(name, phone) {
    // This is a placeholder - implement actual QR code generation
    const data = encodeURIComponent(`Name: ${name}, Phone: ${phone}`);
    return `https://api.qrserver.com/v1/create-qr-code/?data=${data}&size=200x200`;
  }
}

export default new ReviewService();