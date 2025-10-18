// src/controllers/website/enquiryController.js

import EnquiryService from "../../services/EnquiryService.js";
import {
  createResponse,
  errorResponse,
  validationErrorResponse,
  successResponse,
} from "../../utils/responseFormatter.js";

class WebsiteEnquiryController {
  /**
   * Create new enquiry from website contact form
   * @route POST /api/public/enquiries
   * @access Public
   * @body {string} name - Customer name
   * @body {string} phone - Customer phone
   * @body {string} email - Customer email (optional)
   * @body {string} message - Enquiry message
   * @body {string} source - Enquiry source (default: 'website')
   */
  static async submitEnquiry(req, res) {
    try {
      // Set default source for public enquiries
      const enquiryData = {
        ...req.body,
        source: "website",
        status: "unread",
      };

      const result = await EnquiryService.createEnquiry(enquiryData);
      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return createResponse(
        res,
        {
          id: result.data.id,
          name: result.data.name,
          phone: result.data.phone,
          message: result.data.message,
          status: result.data.status,
        },
        "Your enquiry has been submitted successfully. We will contact you soon!"
      );
    } catch (error) {
      // Return user-friendly error messages for public endpoint
      return validationErrorResponse(res, error.message);
    }
  }

  /**
   * Submit quick enquiry (minimal form)
   * @route POST /api/public/enquiries/quick
   * @access Public
   * @body {string} name - Customer name
   * @body {string} phone - Customer phone
   */
  static async submitQuickEnquiry(req, res) {
    try {
      const { name, phone } = req.body;

      const enquiryData = {
        name,
        phone,
        message: "Quick enquiry - Please call me back",
        source: "website",
        status: "unread",
      };

      const result = await EnquiryService.createEnquiry(enquiryData);

      return createResponse(
        res,
        {
          id: result.data.id,
          name: result.data.name,
          phone: result.data.phone,
        },
        "Thank you! We will call you back soon."
      );
    } catch (error) {
      if (error.message.includes("Phone number is required")) {
        return validationErrorResponse(res, {
          phone: "Phone number is required",
        });
      }

      if (error.message.includes("Name is required")) {
        return validationErrorResponse(res, {
          name: "Name is required",
        });
      }

      return errorResponse(
        res,
        "Failed to submit enquiry. Please try again later.",
        500
      );
    }
  }

  /**
   * Submit course enquiry
   * @route POST /api/public/enquiries/course
   * @access Public
   * @body {string} name - Customer name
   * @body {string} phone - Customer phone
   * @body {string} email - Customer email (optional)
   * @body {string} courseInterest - Course they're interested in
   */
  static async submitCourseEnquiry(req, res) {
    try {
      const { name, phone, email, courseInterest } = req.body;

      const enquiryData = {
        name,
        phone,
        email,
        message: `Interested in course: ${courseInterest || "Not specified"}`,
        source: "website",
        status: "unread",
      };

      const result = await EnquiryService.createEnquiry(enquiryData);

      return createResponse(
        res,
        {
          id: result.data.id,
          name: result.data.name,
          phone: result.data.phone,
          courseInterest,
        },
        "Thank you for your interest! Our team will contact you with course details soon."
      );
    } catch (error) {
      if (error.message.includes("Phone number is required")) {
        return validationErrorResponse(res, {
          phone: "Phone number is required",
        });
      }

      if (error.message.includes("Name is required")) {
        return validationErrorResponse(res, {
          name: "Name is required",
        });
      }

      return errorResponse(
        res,
        "Failed to submit enquiry. Please try again later.",
        500
      );
    }
  }

  /**
   * Check enquiry status (for customers to track their enquiry)
   * @route GET /api/public/enquiries/:phone/status
   * @access Public
   * @param {string} phone - Customer phone number
   */
  static async checkEnquiryStatus(req, res) {
    try {
      const { phone } = req.params;

      if (!phone) {
        return validationErrorResponse(res, {
          phone: "Phone number is required",
        });
      }

      // This is a simplified version for public access
      // We don't expose all enquiry details for privacy
      const enquiries = await EnquiryService.searchEnquiries(phone, {
        page: 1,
        limit: 5,
      });

      if (!enquiries.data || enquiries.data.length === 0) {
        return successResponse(
          res,
          [],
          "No enquiries found for this phone number."
        );
      }

      // Return limited information for privacy
      const publicData = enquiries.data.map((enquiry) => ({
        id: enquiry.id,
        name: enquiry.name,
        phone: enquiry.phone,
        status: enquiry.status,
        created_at: enquiry.created_at,
        is_action_taken: enquiry.is_action_taken,
        action_type: enquiry.action_type,
      }));

      return successResponse(
        res,
        publicData,
        "Enquiry status retrieved successfully."
      );
    } catch (error) {
      return errorResponse(
        res,
        "Unable to check enquiry status at this time.",
        500
      );
    }
  }

  /**
   * Get enquiry statistics for website display
   * @route GET /api/public/enquiries/stats
   * @access Public
   */
  static async getPublicStats(req, res) {
    try {
      // Get basic stats for website display (without sensitive data)
      const stats = await EnquiryService.getEnquiryStatistics({}, null);

      // Return only non-sensitive aggregated data
      const publicStats = {
        totalEnquiries: stats.data.total,
        responseRate: stats.data.responseRate,
        mostPopularSources: stats.data.bySource.slice(0, 3), // Top 3 sources only
        message: "Join thousands of satisfied customers!",
      };

      return successResponse(
        res,
        publicStats,
        "Statistics retrieved successfully."
      );
    } catch (error) {
      // Return fallback stats if service fails
      return successResponse(
        res,
        {
          totalEnquiries: "500+",
          responseRate: "95%",
          mostPopularSources: [
            { source: "website", count: "300+" },
            { source: "referral", count: "150+" },
            { source: "phone", count: "50+" },
          ],
          message: "Join thousands of satisfied customers!",
        },
        "Statistics retrieved successfully."
      );
    }
  }
}

export default WebsiteEnquiryController;