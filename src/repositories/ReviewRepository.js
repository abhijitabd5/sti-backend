// src/repositories/ReviewRepository.js
import { Review, Student, User } from '../models/index.js';
import { Op } from 'sequelize';

class ReviewRepository {
  /**
   * Create a new review
   * @param {Object} reviewData - Review data
   * @param {Number} currentUserId - User creating the review
   * @returns {Promise<Object>} Created review
   */
  async create(reviewData, currentUserId) {
    return await Review.create(reviewData, { currentUserId });
  }

  /**
   * Find review by ID
   * @param {Number} id - Review ID
   * @param {Boolean} includeDeleted - Include soft-deleted records
   * @returns {Promise<Object|null>} Review or null
   */
  async findById(id, includeDeleted = false) {
    const options = {
      where: { id },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'phone'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'mobile', 'email']
            }
          ]
        }
      ]
    };

    if (includeDeleted) {
      options.paranoid = false;
    }

    return await Review.findOne(options);
  }

  /**
   * Find all reviews with filtering and pagination
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Object>} Reviews with count
   */
  async findAll(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      is_approved,
      is_enrolled_student,
      rating,
      student_id,
      sortBy = 'display_order',
      sortOrder = 'ASC'
    } = filters;

    const offset = (page - 1) * limit;
    const whereConditions = { is_deleted: false };

    // Search in name, city, or review_text
    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } },
        { review_text: { [Op.like]: `%${search}%` } }
      ];
    }

    // Filter by approval status
    if (is_approved !== undefined) {
      whereConditions.is_approved = is_approved === 'true' || is_approved === true;
    }

    // Filter by enrolled student status
    if (is_enrolled_student !== undefined) {
      whereConditions.is_enrolled_student = is_enrolled_student === 'true' || is_enrolled_student === true;
    }

    // Filter by rating
    if (rating) {
      whereConditions.rating = parseInt(rating);
    }

    // Filter by student ID
    if (student_id) {
      whereConditions.student_id = student_id;
    }

    const { count, rows } = await Review.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'phone'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      distinct: true
    });

    return {
      reviews: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    };
  }

  /**
   * Update review
   * @param {Number} id - Review ID
   * @param {Object} updateData - Data to update
   * @param {Number} currentUserId - User making the update
   * @returns {Promise<Object>} Updated review
   */
  async update(id, updateData, currentUserId) {
    const review = await Review.findByPk(id);
    if (!review) {
      return null;
    }

    await review.update(updateData, { currentUserId });
    return await this.findById(id);
  }

  /**
   * Soft delete review
   * @param {Number} id - Review ID
   * @param {Number} currentUserId - User deleting the review
   * @returns {Promise<Boolean>} Success status
   */
  async softDelete(id, currentUserId) {
    const review = await Review.findByPk(id);
    if (!review) {
      return false;
    }

    await review.destroy({ currentUserId });
    return true;
  }

  /**
   * Change approval status of review
   * @param {Number} id - Review ID
   * @param {Boolean} isApproved - New approval status
   * @param {Number} currentUserId - User changing the status
   * @returns {Promise<Object>} Updated review
   */
  async changeApprovalStatus(id, isApproved, currentUserId) {
    const review = await Review.findByPk(id);
    if (!review) {
      return null;
    }

    const updateData = {
      is_approved: isApproved
    };

    // Reset display_order to 0 if disapproving
    if (!isApproved) {
      updateData.display_order = 0;
    }

    await review.update(updateData, { currentUserId });
    return await this.findById(id);
  }

  /**
   * Reorder reviews
   * @param {Array} reviewsData - Array of {id, display_order}
   * @param {Number} currentUserId - User performing reorder
   * @returns {Promise<Array>} Updated reviews
   */
  async reorder(reviewsData, currentUserId) {
    const updates = [];

    for (const item of reviewsData) {
      const review = await Review.findByPk(item.id);
      
      if (review && review.is_approved) {
        await review.update(
          { display_order: item.display_order },
          { currentUserId }
        );
        updates.push(review);
      }
    }

    return updates;
  }

  /**
   * Check if review exists
   * @param {Number} id - Review ID
   * @returns {Promise<Boolean>} Exists status
   */
  async exists(id) {
    const count = await Review.count({
      where: { id, is_deleted: false }
    });
    return count > 0;
  }

  /**
   * Get approved reviews for public display
   * @param {Number} limit - Number of reviews to fetch
   * @returns {Promise<Array>} Approved reviews
   */
  async getApprovedReviews(limit = 10) {
    return await Review.findAll({
      where: {
        is_approved: true,
        is_deleted: false
      },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['display_order', 'ASC']],
      limit: parseInt(limit)
    });
  }

  /**
   * Get review statistics
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics() {
    const total = await Review.count({ where: { is_deleted: false } });
    const approved = await Review.count({ 
      where: { is_approved: true, is_deleted: false } 
    });
    const pending = await Review.count({ 
      where: { is_approved: false, is_deleted: false } 
    });
    const enrolledStudents = await Review.count({
      where: { is_enrolled_student: true, is_deleted: false }
    });

    const avgRating = await Review.findOne({
      attributes: [
        [Review.sequelize.fn('AVG', Review.sequelize.col('rating')), 'average']
      ],
      where: { is_approved: true, is_deleted: false },
      raw: true
    });

    return {
      total,
      approved,
      pending,
      enrolledStudents,
      averageRating: parseFloat(avgRating?.average || 0).toFixed(2)
    };
  }
}

export default new ReviewRepository();