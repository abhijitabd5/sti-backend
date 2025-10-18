// src/controllers/internal/EnquiryController.js

import EnquiryService from "../../services/EnquiryService.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  createResponse,
  notFoundResponse,
  validationErrorResponse,
} from "../../utils/responseFormatter.js";

class EnquiryController {
  static async createEnquiry(req, res) {
    try {
      console.log('Result is : ',result);
      const result = await EnquiryService.createEnquiry(req.body, req.user.id);
      console.log('Result is : ',result);
      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }
      return createResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }


  static async getAllEnquiries(req, res) {
    try {
      const {
        status,
        source,
        search,
        is_action_taken,
        action_type,
        startDate,
        endDate,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "DESC",
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (source) filters.source = source;
      if (search) filters.searchTerm = search;
      if (is_action_taken !== undefined)
        filters.is_action_taken = is_action_taken === "true";
      if (action_type) filters.action_type = action_type;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const pagination = { page: parseInt(page), limit: parseInt(limit) };
      const sorting = { sortBy, sortOrder };

      const result = await EnquiryService.getAllEnquiries(
        filters,
        pagination,
        sorting,
        req.user.id
      );

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
   * Get enquiry by ID
   * @route GET /api/internal/enquiries/:id
   * @access Private (Admin, Marketing, Employee)
   */
  static async getEnquiryById(req, res) {
    try {
      const result = await EnquiryService.getEnquiryById(
        req.params.id,
        req.user.id
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes("not found")) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Update enquiry
   * @route PUT /api/internal/enquiries/:id
   * @access Private (Admin, Marketing, Employee)
   */
  static async updateEnquiry(req, res) {
    try {
      const result = await EnquiryService.updateEnquiry(
        req.params.id,
        req.body,
        req.user.id
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes("not found")) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Delete enquiry (soft delete)
   * @route DELETE /api/internal/enquiries/:id
   * @access Private (Admin, Marketing)
   */
  static async deleteEnquiry(req, res) {
    try {
      const result = await EnquiryService.deleteEnquiry(
        req.params.id,
        req.user.id
      );
      return successResponse(res, null, result.message);
    } catch (error) {
      if (error.message.includes("not found")) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Mark enquiry as read
   * @route PATCH /api/internal/enquiries/:id/read
   * @access Private (Admin, Marketing, Employee)
   */
  static async markAsRead(req, res) {
    try {
      const result = await EnquiryService.markAsRead(
        req.params.id,
        req.user.id
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes("not found")) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Mark action as taken on enquiry
   * @route PATCH /api/internal/enquiries/:id/action
   * @access Private (Admin, Marketing, Employee)
   * @body {string} action_type - Type of action taken
   * @body {string} remark - Action remark
   */
  static async markActionTaken(req, res) {
    try {
      const { action_type, remark } = req.body;

      if (!action_type) {
        return validationErrorResponse(res, {
          action_type: "Action type is required",
        });
      }

      const result = await EnquiryService.markActionTaken(
        req.params.id,
        { action_type, remark },
        req.user.id
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes("not found")) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get enquiry statistics
   * @route GET /api/internal/enquiries/stats
   * @access Private (Admin, Marketing)
   * @query {string} startDate - Start date filter
   * @query {string} endDate - End date filter
   */
  static async getEnquiryStatistics(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const dateRange = {};

      if (startDate) dateRange.startDate = startDate;
      if (endDate) dateRange.endDate = endDate;

      const result = await EnquiryService.getEnquiryStatistics(
        dateRange,
        req.user.id
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get recent enquiries
   * @route GET /api/internal/enquiries/recent
   * @access Private (Admin, Marketing, Employee)
   * @query {number} limit - Number of recent enquiries (default: 10)
   */
  static async getRecentEnquiries(req, res) {
    try {
      const { limit = 10 } = req.query;
      const result = await EnquiryService.getRecentEnquiries(
        parseInt(limit),
        req.user.id
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Search enquiries
   * @route GET /api/internal/enquiries/search
   * @access Private (Admin, Marketing, Employee)
   * @query {string} q - Search query
   * @query {number} page - Page number
   * @query {number} limit - Items per page
   */
  static async searchEnquiries(req, res) {
    try {
      const { q: searchTerm, page = 1, limit = 10 } = req.query;

      if (!searchTerm) {
        return validationErrorResponse(res, { q: "Search query is required" });
      }

      const pagination = { page: parseInt(page), limit: parseInt(limit) };
      const result = await EnquiryService.searchEnquiries(
        searchTerm,
        pagination,
        req.user.id
      );

      return paginatedResponse(
        res,
        result.data,
        result.pagination,
        result.message
      );
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get enquiries by status
   * @route GET /api/internal/enquiries/status/:status
   * @access Private (Admin, Marketing, Employee)
   * @param {string} status - Enquiry status (unread/read/action_taken/discard)
   */
  static async getEnquiriesByStatus(req, res) {
    try {
      const { status } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const pagination = { page: parseInt(page), limit: parseInt(limit) };
      const result = await EnquiryService.getEnquiriesByStatus(
        status,
        pagination,
        req.user.id
      );

      return paginatedResponse(
        res,
        result.data,
        result.pagination,
        result.message
      );
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get enquiries by source
   * @route GET /api/internal/enquiries/source/:source
   * @access Private (Admin, Marketing, Employee)
   * @param {string} source - Enquiry source (website/phone/referral/ad/other)
   */
  static async getEnquiriesBySource(req, res) {
    try {
      const { source } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const pagination = { page: parseInt(page), limit: parseInt(limit) };
      const result = await EnquiryService.getEnquiriesBySource(
        source,
        pagination,
        req.user.id
      );

      return paginatedResponse(
        res,
        result.data,
        result.pagination,
        result.message
      );
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Bulk update enquiry status
   * @route PATCH /api/internal/enquiries/bulk-status
   * @access Private (Admin, Marketing)
   * @body {Array} ids - Array of enquiry IDs
   * @body {string} status - New status to set
   */
  static async bulkUpdateStatus(req, res) {
    try {
      const { ids, status } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return validationErrorResponse(res, {
          ids: "IDs array is required and cannot be empty",
        });
      }

      if (!status) {
        return validationErrorResponse(res, { status: "Status is required" });
      }

      const result = await EnquiryService.bulkUpdateStatus(
        ids,
        status,
        req.user.id
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get enquiry dashboard data
   * @route GET /api/internal/enquiries/dashboard
   * @access Private (Admin, Marketing)
   * @query {string} period - Time period (today/week/month/year)
   */
  static async getDashboardData(req, res) {
    try {
      const { period = "month" } = req.query;

      // Calculate date range based on period
      const now = new Date();
      let startDate;

      switch (period) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case "week":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 7
          );
          break;
        case "month":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
          );
          break;
        case "year":
          startDate = new Date(
            now.getFullYear() - 1,
            now.getMonth(),
            now.getDate()
          );
          break;
        default:
          startDate = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
          );
      }

      const dateRange = {
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
      };

      // Get statistics and recent enquiries in parallel
      const [stats, recentEnquiries] = await Promise.all([
        EnquiryService.getEnquiryStatistics(dateRange, req.user.id),
        EnquiryService.getRecentEnquiries(5, req.user.id),
      ]);

      return successResponse(
        res,
        {
          period,
          dateRange,
          statistics: stats.data,
          recentEnquiries: recentEnquiries.data,
        },
        "Dashboard data retrieved successfully"
      );
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async exportEnquiries(req, res) {
    try {
      const { format = "json", status, source, startDate, endDate } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (source) filters.source = source;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      // Get all enquiries without pagination for export
      const pagination = { page: 1, limit: 10000 }; // Large limit for export
      const sorting = { sortBy: "createdAt", sortOrder: "DESC" };

      const result = await EnquiryService.getAllEnquiries(
        filters,
        pagination,
        sorting,
        req.user.id
      );

      if (format === "csv") {
        // Set CSV headers
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=enquiries.csv"
        );

        // Convert to CSV format
        const csvHeader =
          "ID,Name,Email,Phone,Message,Source,Status,Action Taken,Action Type,Remark,Created At\n";
        const csvData = result.data
          .map((enquiry) => {
            return [
              enquiry.id,
              `"${enquiry.name || ""}"`,
              `"${enquiry.email || ""}"`,
              `"${enquiry.phone || ""}"`,
              `"${(enquiry.message || "").replace(/"/g, '""')}"`,
              enquiry.source,
              enquiry.status,
              enquiry.is_action_taken,
              enquiry.action_type || "",
              `"${(enquiry.remark || "").replace(/"/g, '""')}"`,
              enquiry.createdAt,
            ].join(",");
          })
          .join("\n");

        return res.send(csvHeader + csvData);
      }

      // Default JSON export
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=enquiries.json"
      );
      return res.json({
        success: true,
        message: "Enquiries exported successfully",
        exportDate: new Date().toISOString(),
        totalRecords: result.data.length,
        filters,
        data: result.data,
      });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}

export default EnquiryController;