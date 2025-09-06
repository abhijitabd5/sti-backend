// src/services/EnquiryService.js

import EnquiryRepository from "../repositories/EnquiryRepository.js";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../constants/messages.js";

class EnquiryService {
  /**
   * Create new enquiry (Public endpoint - website contact form)
   * @param {Object} enquiryData - Enquiry data
   * @param {number} currentUserId - ID of current user (optional for public)
   * @returns {Promise<Object>}
   */
  async createEnquiry(enquiryData, currentUserId = null) {
    try {
      this.validateEnquiryData(enquiryData);

      if (enquiryData.phone) {
        const existingEnquiries = await EnquiryRepository.findByPhone(
          enquiryData.phone
        );
        if (existingEnquiries.length > 0) {
          console.log("Found potential duplicate");
          return {
            success: false,
            message: `Potential duplicate - Phone ${enquiryData.phone} has ${existingEnquiries.length} existing enquiries`,
            data: null,
          };
        }
      }

      // Set default values
      const processedData = {
        ...enquiryData,
        status: enquiryData.status || "unread",
        source: enquiryData.source || "website",
        is_action_taken: false,
      };

      const options = currentUserId ? { currentUserId } : {};
      const enquiry = await EnquiryRepository.create(processedData, options);

      return {
        success: true,
        message: SUCCESS_MESSAGES.ENQUIRY_CREATED,
        data: enquiry,
      };
    } catch (error) {
      console.error('Error creating enquiry:', error);
      throw new Error(error.message || ERROR_MESSAGES.ENQUIRY_CREATE_FAILED);
    }
  }

  /**
   * Get all enquiries with filtering and pagination
   * @param {Object} filters - Filter conditions
   * @param {Object} pagination - Pagination options
   * @param {Object} sorting - Sorting options
   * @param {number} currentUserId - ID of current user
   * @returns {Promise<Object>}
   */
  async getAllEnquiries(
    filters = {},
    pagination = {},
    sorting = {},
    currentUserId
  ) {
    try {
      const result = await EnquiryRepository.findAll(
        filters,
        pagination,
        sorting
      );

      const { page = 1, limit = 10 } = pagination;
      const paginationData = {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.count,
        totalPages: Math.ceil(result.count / parseInt(limit)),
        hasNext: parseInt(page) < Math.ceil(result.count / parseInt(limit)),
        hasPrev: parseInt(page) > 1,
      };

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: result.rows,
        pagination: paginationData,
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.DATA_FETCH_FAILED);
    }
  }

  /**
   * Get enquiry by ID
   * @param {number} id - Enquiry ID
   * @param {number} currentUserId - ID of current user
   * @returns {Promise<Object>}
   */
  async getEnquiryById(id, currentUserId) {
    try {
      if (!id || isNaN(id)) {
        throw new Error(ERROR_MESSAGES.INVALID_ENQUIRY_ID);
      }

      const enquiry = await EnquiryRepository.findById(id);
      if (!enquiry) {
        throw new Error(ERROR_MESSAGES.ENQUIRY_NOT_FOUND);
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: enquiry,
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.DATA_FETCH_FAILED);
    }
  }

  /**
   * Update enquiry
   * @param {number} id - Enquiry ID
   * @param {Object} updateData - Data to update
   * @param {number} currentUserId - ID of current user
   * @returns {Promise<Object>}
   */
  async updateEnquiry(id, updateData, currentUserId) {
    try {
      if (!id || isNaN(id)) {
        throw new Error(ERROR_MESSAGES.INVALID_ENQUIRY_ID);
      }

      // Check if enquiry exists
      const existingEnquiry = await EnquiryRepository.findById(id);
      if (!existingEnquiry) {
        throw new Error(ERROR_MESSAGES.ENQUIRY_NOT_FOUND);
      }

      // Validate update data
      this.validateUpdateData(updateData);

      // Remove fields that shouldn't be updated directly
      const {
        id: _,
        created_at,
        updated_at,
        deleted_at,
        created_by,
        updated_by,
        is_deleted,
        deleted_by,
        ...cleanData
      } = updateData;

      const options = { currentUserId };
      await EnquiryRepository.update(id, cleanData, options);

      // Get updated enquiry
      const updatedEnquiry = await EnquiryRepository.findById(id);

      return {
        success: true,
        message: SUCCESS_MESSAGES.ENQUIRY_UPDATED,
        data: updatedEnquiry,
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.ENQUIRY_UPDATE_FAILED);
    }
  }

  /**
   * Delete enquiry (soft delete)
   * @param {number} id - Enquiry ID
   * @param {number} currentUserId - ID of current user
   * @returns {Promise<Object>}
   */
  async deleteEnquiry(id, currentUserId) {
    try {
      if (!id || isNaN(id)) {
        throw new Error(ERROR_MESSAGES.INVALID_ENQUIRY_ID);
      }

      // Check if enquiry exists
      const existingEnquiry = await EnquiryRepository.findById(id);
      if (!existingEnquiry) {
        throw new Error(ERROR_MESSAGES.ENQUIRY_NOT_FOUND);
      }

      const options = { currentUserId };
      await EnquiryRepository.delete(id, options);

      return {
        success: true,
        message: SUCCESS_MESSAGES.ENQUIRY_DELETED,
        data: null,
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.ENQUIRY_DELETE_FAILED);
    }
  }

  /**
   * Mark enquiry as read
   * @param {number} id - Enquiry ID
   * @param {number} currentUserId - ID of current user
   * @returns {Promise<Object>}
   */
  async markAsRead(id, currentUserId) {
    try {
      if (!id || isNaN(id)) {
        throw new Error(ERROR_MESSAGES.INVALID_ENQUIRY_ID);
      }

      // Check if enquiry exists
      const existingEnquiry = await EnquiryRepository.findById(id);
      if (!existingEnquiry) {
        throw new Error(ERROR_MESSAGES.ENQUIRY_NOT_FOUND);
      }

      // Don't update if already read
      if (existingEnquiry.status === "read") {
        return {
          success: true,
          message: "Enquiry already marked as read",
          data: existingEnquiry,
        };
      }

      const options = { currentUserId };
      await EnquiryRepository.markAsRead(id, options);

      // Get updated enquiry
      const updatedEnquiry = await EnquiryRepository.findById(id);

      return {
        success: true,
        message: SUCCESS_MESSAGES.ENQUIRY_MARKED_READ,
        data: updatedEnquiry,
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.ENQUIRY_UPDATE_FAILED);
    }
  }

  /**
   * Mark action as taken on enquiry
   * @param {number} id - Enquiry ID
   * @param {Object} actionData - Action data (action_type, remark)
   * @param {number} currentUserId - ID of current user
   * @returns {Promise<Object>}
   */
  async markActionTaken(id, actionData, currentUserId) {
    try {
      if (!id || isNaN(id)) {
        throw new Error(ERROR_MESSAGES.INVALID_ENQUIRY_ID);
      }

      // Validate action data
      if (!actionData.action_type) {
        throw new Error("Action type is required");
      }

      const validActionTypes = [
        "call",
        "whatsapp",
        "email",
        "text_message",
        "visit",
      ];
      if (!validActionTypes.includes(actionData.action_type)) {
        throw new Error("Invalid action type");
      }

      // Check if enquiry exists
      const existingEnquiry = await EnquiryRepository.findById(id);
      if (!existingEnquiry) {
        throw new Error(ERROR_MESSAGES.ENQUIRY_NOT_FOUND);
      }

      const options = { currentUserId };
      await EnquiryRepository.markActionTaken(
        id,
        actionData.action_type,
        actionData.remark || "",
        options
      );

      // Get updated enquiry
      const updatedEnquiry = await EnquiryRepository.findById(id);

      return {
        success: true,
        message: SUCCESS_MESSAGES.ENQUIRY_ACTION_TAKEN,
        data: updatedEnquiry,
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.ENQUIRY_UPDATE_FAILED);
    }
  }

  /**
   * Get enquiry statistics
   * @param {Object} dateRange - Date range filter
   * @param {number} currentUserId - ID of current user
   * @returns {Promise<Object>}
   */
  async getEnquiryStatistics(dateRange = {}, currentUserId) {
    try {
      const stats = await EnquiryRepository.getStatistics(dateRange);

      // Calculate conversion rates
      const conversionRate =
        stats.total > 0
          ? ((stats.byStatus.action_taken / stats.total) * 100).toFixed(2)
          : 0;

      const responseRate =
        stats.total > 0
          ? (
              ((stats.byStatus.read + stats.byStatus.action_taken) /
                stats.total) *
              100
            ).toFixed(2)
          : 0;

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: {
          ...stats,
          conversionRate: parseFloat(conversionRate),
          responseRate: parseFloat(responseRate),
        },
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.DATA_FETCH_FAILED);
    }
  }

  /**
   * Get recent enquiries
   * @param {number} limit - Number of recent enquiries
   * @param {number} currentUserId - ID of current user
   * @returns {Promise<Object>}
   */
  async getRecentEnquiries(limit = 10, currentUserId) {
    try {
      const enquiries = await EnquiryRepository.getRecent(limit);

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: enquiries,
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.DATA_FETCH_FAILED);
    }
  }

  /**
   * Search enquiries
   * @param {string} searchTerm - Search term
   * @param {Object} pagination - Pagination options
   * @param {number} currentUserId - ID of current user
   * @returns {Promise<Object>}
   */
  async searchEnquiries(searchTerm, pagination = {}, currentUserId) {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new Error("Search term must be at least 2 characters long");
      }

      const result = await EnquiryRepository.search(
        searchTerm.trim(),
        pagination
      );

      const { page = 1, limit = 10 } = pagination;
      const paginationData = {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.count,
        totalPages: Math.ceil(result.count / parseInt(limit)),
        hasNext: parseInt(page) < Math.ceil(result.count / parseInt(limit)),
        hasPrev: parseInt(page) > 1,
      };

      return {
        success: true,
        message: `Found ${result.count} enquiries matching "${searchTerm}"`,
        data: result.rows,
        pagination: paginationData,
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.SEARCH_FAILED);
    }
  }

  /**
   * Get enquiries by status
   * @param {string} status - Enquiry status
   * @param {Object} pagination - Pagination options
   * @param {number} currentUserId - ID of current user
   * @returns {Promise<Object>}
   */
  async getEnquiriesByStatus(status, pagination = {}, currentUserId) {
    try {
      const validStatuses = ["unread", "read", "action_taken", "discard"];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
      }

      const result = await EnquiryRepository.findByStatus(status, pagination);

      const { page = 1, limit = 10 } = pagination;
      const paginationData = {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.count,
        totalPages: Math.ceil(result.count / parseInt(limit)),
        hasNext: parseInt(page) < Math.ceil(result.count / parseInt(limit)),
        hasPrev: parseInt(page) > 1,
      };

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: result.rows,
        pagination: paginationData,
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.DATA_FETCH_FAILED);
    }
  }

  /**
   * Get enquiries by source
   * @param {string} source - Enquiry source
   * @param {Object} pagination - Pagination options
   * @param {number} currentUserId - ID of current user
   * @returns {Promise<Object>}
   */
  async getEnquiriesBySource(source, pagination = {}, currentUserId) {
    try {
      const validSources = ["website", "phone", "referral", "ad", "other"];
      if (!validSources.includes(source)) {
        throw new Error("Invalid source");
      }

      const result = await EnquiryRepository.findBySource(source, pagination);

      const { page = 1, limit = 10 } = pagination;
      const paginationData = {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.count,
        totalPages: Math.ceil(result.count / parseInt(limit)),
        hasNext: parseInt(page) < Math.ceil(result.count / parseInt(limit)),
        hasPrev: parseInt(page) > 1,
      };

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: result.rows,
        pagination: paginationData,
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.DATA_FETCH_FAILED);
    }
  }

  /**
   * Bulk update enquiry status
   * @param {Array} ids - Array of enquiry IDs
   * @param {string} status - New status
   * @param {number} currentUserId - ID of current user
   * @returns {Promise<Object>}
   */
  async bulkUpdateStatus(ids, status, currentUserId) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error("IDs array is required and cannot be empty");
      }

      const validStatuses = ["unread", "read", "action_taken", "discard"];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
      }

      const updatePromises = ids.map((id) =>
        EnquiryRepository.update(id, { status }, { currentUserId })
      );

      await Promise.all(updatePromises);

      return {
        success: true,
        message: `${ids.length} enquiries updated successfully`,
        data: { updatedCount: ids.length },
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.BULK_UPDATE_FAILED);
    }
  }

  /**
   * Validate enquiry data for creation
   * @param {Object} enquiryData - Enquiry data to validate
   */
  validateEnquiryData(enquiryData) {
    if (!enquiryData.name || enquiryData.name.trim().length < 2) {
      throw new Error(
        "Name is required and must be at least 2 characters long"
      );
    }

    if (!enquiryData.phone) {
      throw new Error("Phone number is required");
    }

    // Phone number format validation
    const phoneRegex = /^[+]?[\d\s\-()]{10,15}$/;
    if (!phoneRegex.test(enquiryData.phone.replace(/\s/g, ""))) {
      throw new Error("Invalid phone number format");
    }

    // Email validation (if provided)
    if (enquiryData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(enquiryData.email)) {
        throw new Error("Invalid email format");
      }
    }

    if (!enquiryData.message || enquiryData.message.trim().length < 5) {
      throw new Error(
        "Message is required and must be at least 5 characters long"
      );
    }

    // Validate enum values
    if (enquiryData.source) {
      const validSources = ["website", "phone", "referral", "ad", "other"];
      if (!validSources.includes(enquiryData.source)) {
        throw new Error("Invalid source value");
      }
    }

    if (enquiryData.status) {
      const validStatuses = ["unread", "read", "action_taken", "discard"];
      if (!validStatuses.includes(enquiryData.status)) {
        throw new Error("Invalid status value");
      }
    }
  }

  /**
   * Validate update data
   * @param {Object} updateData - Data to validate
   */
  validateUpdateData(updateData) {
    if (updateData.name && updateData.name.trim().length < 2) {
      throw new Error("Name must be at least 2 characters long");
    }

    if (updateData.phone) {
      const phoneRegex = /^[+]?[\d\s\-()]{10,15}$/;
      if (!phoneRegex.test(updateData.phone.replace(/\s/g, ""))) {
        throw new Error("Invalid phone number format");
      }
    }

    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        throw new Error("Invalid email format");
      }
    }

    if (updateData.message && updateData.message.trim().length < 5) {
      throw new Error("Message must be at least 5 characters long");
    }

    if (updateData.source) {
      const validSources = ["website", "phone", "referral", "ad", "other"];
      if (!validSources.includes(updateData.source)) {
        throw new Error("Invalid source value");
      }
    }

    if (updateData.status) {
      const validStatuses = ["unread", "read", "action_taken", "discard"];
      if (!validStatuses.includes(updateData.status)) {
        throw new Error("Invalid status value");
      }
    }

    if (updateData.action_type) {
      const validActionTypes = [
        "call",
        "whatsapp",
        "email",
        "text_message",
        "visit",
      ];
      if (!validActionTypes.includes(updateData.action_type)) {
        throw new Error("Invalid action type value");
      }
    }
  }
}

export default new EnquiryService();
