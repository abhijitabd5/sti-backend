// src/repositories/EnquiryRepository.js

import { Enquiry } from "../models/index.js";
import { Op } from "sequelize";

class EnquiryRepository {
  async create(enquiryData, options = {}) {
    return await Enquiry.create(enquiryData, options);
  }

  /**
   * Find enquiry by ID
   * @param {number} id - Enquiry ID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return await Enquiry.findByPk(id, {
      paranoid: true, // Include soft-deleted records if needed
    });
  }

  /**
   * Find all enquiries with filtering, sorting, and pagination
   * @param {Object} filters - Filter conditions
   * @param {Object} pagination - Pagination options
   * @param {Object} sorting - Sorting options
   * @returns {Promise<Object>}
   */
  async findAll(filters = {}, pagination = {}, sorting = {}) {
    const { page = 1, limit = 10 } = pagination;
    const { sortBy = "created_at", sortOrder = "DESC" } = sorting;

    const whereConditions = this.buildWhereConditions(filters);

    const options = {
      where: whereConditions,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      paranoid: true,
    };

    return await Enquiry.findAndCountAll(options);
  }

  /**
   * Update enquiry by ID
   * @param {number} id - Enquiry ID
   * @param {Object} updateData - Data to update
   * @param {Object} options - Options with currentUserId
   * @returns {Promise<Array>}
   */
  async update(id, updateData, options = {}) {
    return await Enquiry.update(updateData, {
      where: { id },
      ...options,
    });
  }

  /**
   * Soft delete enquiry by ID
   * @param {number} id - Enquiry ID
   * @param {Object} options - Options with currentUserId
   * @returns {Promise<number>}
   */
  async delete(id, options = {}) {
    const enquiry = await Enquiry.findByPk(id);
    if (enquiry) {
      return await enquiry.destroy(options);
    }
    return null;
  }

  /**
   * Find enquiries by status
   * @param {string} status - Enquiry status
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>}
   */
  async findByStatus(status, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;

    return await Enquiry.findAndCountAll({
      where: { status },
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      paranoid: true,
    });
  }

  /**
   * Find enquiries by source
   * @param {string} source - Enquiry source
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>}
   */
  async findBySource(source, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;

    return await Enquiry.findAndCountAll({
      where: { source },
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      paranoid: true,
    });
  }

  /**
   * Find enquiry by phone number
   * @param {string} phone - Phone number
   * @returns {Promise<Array>}
   */
  async findByPhone(phone) {
    return await Enquiry.findAll({
      where: {
        phone: phone,
        status: "unread",
      },
      order: [["createdAt", "DESC"]],
      paranoid: true,
    });
  }

  /**
   * Find enquiry by email
   * @param {string} email - Email address
   * @returns {Promise<Array>}
   */
  async findByEmail(email) {
    return await Enquiry.findAll({
      where: { email },
      order: [["created_at", "DESC"]],
      paranoid: true,
    });
  }

  /**
   * Get enquiry statistics
   * @param {Object} dateRange - Date range filter
   * @returns {Promise<Object>}
   */
  async getStatistics(dateRange = {}) {
    const { startDate, endDate } = dateRange;
    const whereConditions = {};

    if (startDate && endDate) {
      whereConditions.created_at = {
        [Op.between]: [startDate, endDate],
      };
    }

    const [
      totalCount,
      unreadCount,
      readCount,
      actionTakenCount,
      discardCount,
      sourceStats,
      actionTypeStats,
    ] = await Promise.all([
      // Total enquiries
      Enquiry.count({ where: whereConditions, paranoid: true }),

      // Unread enquiries
      Enquiry.count({
        where: { ...whereConditions, status: "unread" },
        paranoid: true,
      }),

      // Read enquiries
      Enquiry.count({
        where: { ...whereConditions, status: "read" },
        paranoid: true,
      }),

      // Action taken enquiries
      Enquiry.count({
        where: { ...whereConditions, status: "action_taken" },
        paranoid: true,
      }),

      // Discarded enquiries
      Enquiry.count({
        where: { ...whereConditions, status: "discard" },
        paranoid: true,
      }),

      // Source-wise statistics
      Enquiry.findAll({
        where: whereConditions,
        attributes: [
          "source",
          [Enquiry.sequelize.fn("COUNT", Enquiry.sequelize.col("id")), "count"],
        ],
        group: ["source"],
        paranoid: true,
      }),

      // Action type statistics
      Enquiry.findAll({
        where: {
          ...whereConditions,
          action_type: { [Op.not]: null },
        },
        attributes: [
          "action_type",
          [Enquiry.sequelize.fn("COUNT", Enquiry.sequelize.col("id")), "count"],
        ],
        group: ["action_type"],
        paranoid: true,
      }),
    ]);

    return {
      total: totalCount,
      byStatus: {
        unread: unreadCount,
        read: readCount,
        action_taken: actionTakenCount,
        discard: discardCount,
      },
      bySource: sourceStats.map((item) => ({
        source: item.source,
        count: parseInt(item.dataValues.count),
      })),
      byActionType: actionTypeStats.map((item) => ({
        action_type: item.action_type,
        count: parseInt(item.dataValues.count),
      })),
    };
  }

  /**
   * Get recent enquiries
   * @param {number} limit - Number of recent enquiries to fetch
   * @returns {Promise<Array>}
   */
  async getRecent(limit = 10) {
    return await Enquiry.findAll({
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      paranoid: true,
    });
  }

  /**
   * Mark enquiry as read
   * @param {number} id - Enquiry ID
   * @param {Object} options - Options with currentUserId
   * @returns {Promise<Array>}
   */
  async markAsRead(id, options = {}) {
    return await Enquiry.update(
      { status: "read" },
      { where: { id }, ...options }
    );
  }

  /**
   * Mark enquiry action as taken
   * @param {number} id - Enquiry ID
   * @param {string} actionType - Type of action taken
   * @param {string} remark - Action remark
   * @param {Object} options - Options with currentUserId
   * @returns {Promise<Array>}
   */
  async markActionTaken(id, actionType, remark, options = {}) {
    return await Enquiry.update(
      {
        status: "action_taken",
        is_action_taken: true,
        action_type: actionType,
        remark: remark,
      },
      { where: { id }, ...options }
    );
  }

  /**
   * Search enquiries by name, email, or phone
   * @param {string} searchTerm - Search term
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>}
   */
  async search(searchTerm, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;

    return await Enquiry.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${searchTerm}%` } },
          { email: { [Op.like]: `%${searchTerm}%` } },
          { phone: { [Op.like]: `%${searchTerm}%` } },
          { message: { [Op.like]: `%${searchTerm}%` } },
        ],
      },
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      paranoid: true,
    });
  }

  /**
   * Build where conditions for filtering
   * @param {Object} filters - Filter object
   * @returns {Object}
   */
  buildWhereConditions(filters) {
    const whereConditions = {};

    if (filters.status) {
      whereConditions.status = filters.status;
    }

    if (filters.source) {
      whereConditions.source = filters.source;
    }

    if (filters.is_action_taken !== undefined) {
      whereConditions.is_action_taken = filters.is_action_taken;
    }

    if (filters.action_type) {
      whereConditions.action_type = filters.action_type;
    }

    if (filters.phone) {
      whereConditions.phone = { [Op.like]: `%${filters.phone}%` };
    }

    if (filters.email) {
      whereConditions.email = { [Op.like]: `%${filters.email}%` };
    }

    if (filters.name) {
      whereConditions.name = { [Op.like]: `%${filters.name}%` };
    }

    if (filters.startDate && filters.endDate) {
      whereConditions.created_at = {
        [Op.between]: [filters.startDate, filters.endDate],
      };
    } else if (filters.startDate) {
      whereConditions.created_at = {
        [Op.gte]: filters.startDate,
      };
    } else if (filters.endDate) {
      whereConditions.created_at = {
        [Op.lte]: filters.endDate,
      };
    }

    if (filters.searchTerm) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${filters.searchTerm}%` } },
        { email: { [Op.like]: `%${filters.searchTerm}%` } },
        { phone: { [Op.like]: `%${filters.searchTerm}%` } },
        { message: { [Op.like]: `%${filters.searchTerm}%` } },
      ];
    }

    return whereConditions;
  }

  /**
   * Check if phone number already exists
   * @param {string} phone - Phone number
   * @param {number} excludeId - ID to exclude from check
   * @returns {Promise<boolean>}
   */
  async phoneExists(phone, excludeId = null) {
    const whereConditions = { phone };

    if (excludeId) {
      whereConditions.id = { [Op.ne]: excludeId };
    }

    const count = await Enquiry.count({
      where: whereConditions,
      paranoid: true,
    });

    return count > 0;
  }

  /**
   * Get enquiries count by date range
   * @param {Object} dateRange - Date range
   * @returns {Promise<number>}
   */
  async getCountByDateRange(dateRange = {}) {
    const { startDate, endDate } = dateRange;
    const whereConditions = {};

    if (startDate && endDate) {
      whereConditions.created_at = {
        [Op.between]: [startDate, endDate],
      };
    }

    return await Enquiry.count({
      where: whereConditions,
      paranoid: true,
    });
  }
}

export default new EnquiryRepository();
