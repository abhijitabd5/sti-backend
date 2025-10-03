// src/controllers/internal/CourseController.js

import CourseService from "../../services/CourseService.js";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  paginatedResponse,
} from "../../utils/responseFormatter.js";
import fs from "fs";
import path from "path";

class CourseController {
  static async getAllCourses(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        is_active,
        language,
        sortBy = "display_order",
        sortOrder = "ASC",
      } = req.query;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

      const filters = {
        page: pageNum,
        limit: limitNum,
        search,
        is_active: is_active !== undefined ? is_active === "true" : undefined,
        language,
        sortBy,
        sortOrder,
      };

      const result = await CourseService.getAllCourses(filters, req.user.id);

      return paginatedResponse(res, result.data, result.pagination, result.message, 200);
    } catch (error) {
      console.error("Error in CourseController.getAllCourses:", error);
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
      console.error("Error in CourseController.getCourseById:", error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async getCourseVariantsByGroupId(req, res) {
  try {
    const { course_group_id } = req.params;
    const result = await CourseService.getCourseVariantsByGroupId(course_group_id);

    if (!result.success) {
      return errorResponse(res, result.message, 404);
    }

    return successResponse(res, result.data, result.message, 200);
  } catch (error) {
    console.error("Error in CourseController.getCourseVariantsByGroupId:", error);
    return errorResponse(res, error.message, 500);
  }
}

  static async createCourse(req, res) {
    try {
      // Extract form data
      const courseData = {
        ...req.body,
        thumbnail: req.files?.thumbnail ? `/uploads/courses/thumbnails/${req.files.thumbnail[0].filename}` : null,
        syllabus_file_path: req.files?.syllabus ? `/uploads/courses/syllabus/${req.files.syllabus[0].filename}` : null,
      };

      // Parse boolean fields from multipart (they come as strings)
      const booleanFields = [
        "is_featured",
        "is_active",
        "show_on_homepage",
        "is_discounted",
        "show_offer_badge",
        "hostel_available",
        "mess_available",
      ];

      booleanFields.forEach((field) => {
        if (courseData[field] !== undefined) {
          courseData[field] = courseData[field] === "true" || courseData[field] === true;
        }
      });

      // Parse numeric fields from multipart (they come as strings)
      const numericFields = [
        "duration",
        "base_course_fee",
        "discount_amount",
        "discount_percentage",
        "hostel_fee",
        "mess_fee",
        "display_order",
      ];

      numericFields.forEach((field) => {
        if (courseData[field] !== undefined && courseData[field] !== "") {
          courseData[field] = parseFloat(courseData[field]);
        }
      });

      const result = await CourseService.createCourse(courseData, req.user.id);

      if (!result.success) {
        // Delete uploaded file if course creation failed
        if (req.file) {
          fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }

        if (result.errors) {
          return validationErrorResponse(res, result.errors, result.message, 400);
        }
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message, 201);
    } catch (error) {
      console.error("Error in CourseController.createCourse:", error);

      // Delete uploaded file on error
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }

      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Update course with optional thumbnail upload
   * @route PUT /api/internal/courses/:id
   * @access Private (Admin, SEO)
   */
  static async updateCourse(req, res) {
    try {
      const { id } = req.params;

      // Extract form data
      const updateData = {
        ...req.body,
      };

      // Handle file upload (only if new file is uploaded)
      if (req.file) {
        updateData.thumbnail = req.file.path;
        updateData.old_thumbnail = req.body.old_thumbnail; // Pass old file path for deletion
      }

      // Parse boolean fields from multipart
      const booleanFields = [
        "is_featured",
        "is_active",
        "show_on_homepage",
        "is_discounted",
        "show_offer_badge",
        "hostel_available",
        "mess_available",
      ];

      booleanFields.forEach((field) => {
        if (updateData[field] !== undefined) {
          updateData[field] = updateData[field] === "true" || updateData[field] === true;
        }
      });

      // Parse numeric fields from multipart
      const numericFields = [
        "duration",
        "base_course_fee",
        "discount_amount",
        "discount_percentage",
        "hostel_fee",
        "mess_fee",
        "display_order",
      ];

      numericFields.forEach((field) => {
        if (updateData[field] !== undefined && updateData[field] !== "") {
          updateData[field] = parseFloat(updateData[field]);
        }
      });

      const result = await CourseService.updateCourse(id, updateData, req.user.id);

      if (!result.success) {
        // Delete uploaded file if update failed
        if (req.file) {
          fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }

        if (result.errors) {
          return validationErrorResponse(res, result.errors, result.message, 400);
        }
        if (result.message.includes("not found")) {
          return errorResponse(res, result.message, 404);
        }
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message, 200);
    } catch (error) {
      console.error("Error in CourseController.updateCourse:", error);

      // Delete uploaded file on error
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }

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
      console.error("Error in CourseController.toggleCourseStatus:", error);
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
      console.error("Error in CourseController.deleteCourse:", error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async reorderCourses(req, res) {
    try {
      console.log("Reached in controller");
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
      console.error("Error in CourseController.reorderCourses:", error);
      return errorResponse(res, error.message, 500);
    }
  }
  
}

export default CourseController;
