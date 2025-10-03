import CourseRepository from "../repositories/CourseRepository.js";
import { generateSlug } from "../utils/slugify.js";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../constants/messages.js";

class CourseService {
  /**
   * Get all courses for internal management
   */
  async getAllCourses(filters, currentUserId) {
    try {
      const result = await CourseRepository.findAll({
        ...filters,
        includeInactive: true, // Internal routes can see inactive courses
      });

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: result.courses,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrev: result.page > 1,
        },
      };
    } catch (error) {
      console.error("Error in CourseService.getAllCourses:", error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Get public courses (active only)
   */
  async getPublicCourses(filters) {
    try {
      const result = await CourseRepository.findAll({
        ...filters,
        includeInactive: false,
      });

      // Use total_fee as the "effective" fee
      const coursesWithEffectiveFee = result.courses.map((course) => {
        const courseData = course.toJSON();
        courseData.effective_fee = course.total_fee;
        return courseData;
      });

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: coursesWithEffectiveFee,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrev: result.page > 1,
        },
      };
    } catch (error) {
      console.error("Error in CourseService.getPublicCourses:", error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Get course by ID
   */
  async getCourseById(id) {
    try {
      const course = await CourseRepository.findById(id);

      if (!course) {
        return {
          success: false,
          message: ERROR_MESSAGES.COURSE_NOT_FOUND,
        };
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: course,
      };
    } catch (error) {
      console.error("Error in CourseService.getCourseById:", error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Get course by slug (public)
   */
  async getCourseBySlug(slug) {
    try {
      const course = await CourseRepository.findBySlug(slug, true);

      if (!course) {
        return {
          success: false,
          message: ERROR_MESSAGES.COURSE_NOT_FOUND,
        };
      }

      const courseData = course.toJSON();
      courseData.effective_fee = course.total_fee;

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: courseData,
      };
    } catch (error) {
      console.error("Error in CourseService.getCourseBySlug:", error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  async getCourseVariantsByGroupId(course_group_id) {
    try {
      const courses = await CourseRepository.findByCourseGroupId(course_group_id);

      if (!courses || courses.length === 0) {
        return {
          success: false,
          message: ERROR_MESSAGES.COURSE_NOT_FOUND,
        };
      }

      // Transform array to object with language keys
      const coursesByLanguage = courses.reduce((acc, course) => {
        acc[course.language] = course;
        return acc;
      }, {});

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: coursesByLanguage,
      };
    } catch (error) {
      console.error("Error in CourseService.getCourseVariantsByGroupId:", error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Create new course
   */
  async deleteOldFile(filePath) {
    if (!filePath) return;

    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`Deleted old file: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }

  /**
   * Create new course
   */
  async createCourse(courseData, currentUserId) {
    try {
      // Validate required fields
      const requiredFields = ["title", "summary", "description", "duration", "base_course_fee"];
      const missingFields = {};

      requiredFields.forEach((field) => {
        if (!courseData[field]) {
          missingFields[field] = `${field.replace(/_/g, " ")} is required`;
        }
      });

      if (Object.keys(missingFields).length > 0) {
        return {
          success: false,
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          errors: missingFields,
        };
      }

      // Generate unique slug
      const baseSlug = await generateSlug(courseData.title);
      let slug = baseSlug;
      let counter = 1;

      while (await CourseRepository.slugExists(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Calculate discount & totals
      const baseFee = parseFloat(courseData.base_course_fee);
      const discountAmount = courseData.is_discounted ? parseFloat(courseData.discount_amount || 0) : 0;
      const discountedCourseFee = baseFee - discountAmount;

      const hostelFee = courseData.hostel_available ? parseFloat(courseData.hostel_fee || 0) : 0;
      const messFee = courseData.mess_available ? parseFloat(courseData.mess_fee || 0) : 0;

      const totalFee = discountedCourseFee + hostelFee + messFee;

      // Prepare course data with file path
      const processedData = {
        ...courseData,
        slug,
        duration: parseInt(courseData.duration),
        base_course_fee: baseFee,
        discount_amount: discountAmount,
        discount_percentage: courseData.is_discounted ? parseFloat(courseData.discount_percentage || 0) : 0,
        discounted_course_fee: discountedCourseFee,
        hostel_fee: hostelFee,
        mess_fee: messFee,
        total_fee: totalFee,
        course_group_id: 500,
        offer_badge_text: courseData.show_offer_badge ? courseData.offer_badge_text : null,
        display_order: parseInt(courseData.display_order || 0),
        // Store relative path for thumbnail
        thumbnail: courseData.thumbnail ? courseData.thumbnail.replace(/\\/g, "/") : null,
        syllabus_file_path: courseData.syllabus_file_path ? courseData.syllabus_file_path.replace(/\\/g, "/") : null,
      };

      const course = await CourseRepository.create(processedData, currentUserId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.COURSE_CREATED,
        data: course,
      };
    } catch (error) {
      console.error("Error in CourseService.createCourse:", error);
      if (error.name === "SequelizeUniqueConstraintError") {
        return {
          success: false,
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          errors: { slug: "A course with similar title already exists" },
        };
      }
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Update course
   */
  async updateCourse(id, updateData, currentUserId) {
    try {
      const course = await CourseRepository.findById(id);

      if (!course) {
        return {
          success: false,
          message: ERROR_MESSAGES.COURSE_NOT_FOUND,
        };
      }

      const processedData = { ...updateData };

      // Handle thumbnail update
      if (updateData.thumbnail) {
        // Use relative path if file uploaded
        processedData.thumbnail = req.file
          ? `/uploads/courses/thumbnails/${req.file.filename}`
          : updateData.thumbnail.replace(/\\/g, "/");

        // Delete old thumbnail if exists and is different
        if (course.thumbnail && course.thumbnail !== processedData.thumbnail) {
          await this.deleteOldFile(course.thumbnail);
        }
      }

      // Generate new slug if title changed
      if (updateData.title && updateData.title !== course.title) {
        const baseSlug = await generateSlug(updateData.title);
        let slug = baseSlug;
        let counter = 1;

        while (await CourseRepository.slugExists(slug, id)) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        processedData.slug = slug;
      }

      // Process numeric fields and recalc totals
      const baseFee =
        updateData.base_course_fee !== undefined
          ? parseFloat(updateData.base_course_fee)
          : parseFloat(course.base_course_fee);

      const discountAmount =
        updateData.is_discounted === false
          ? 0
          : updateData.discount_amount !== undefined
          ? parseFloat(updateData.discount_amount)
          : parseFloat(course.discount_amount || 0);

      const discountedCourseFee = baseFee - discountAmount;

      const hostelFee =
        updateData.hostel_available !== undefined
          ? updateData.hostel_available
            ? parseFloat(updateData.hostel_fee || 0)
            : 0
          : parseFloat(course.hostel_fee || 0);

      const messFee =
        updateData.mess_available !== undefined
          ? updateData.mess_available
            ? parseFloat(updateData.mess_fee || 0)
            : 0
          : parseFloat(course.mess_fee || 0);

      const totalFee = discountedCourseFee + hostelFee + messFee;

      processedData.base_course_fee = baseFee;
      processedData.discount_amount = discountAmount;
      processedData.discounted_course_fee = discountedCourseFee;
      processedData.hostel_fee = hostelFee;
      processedData.mess_fee = messFee;
      processedData.total_fee = totalFee;

      if (updateData.display_order !== undefined) {
        processedData.display_order = parseInt(updateData.display_order);
      }

      if (updateData.show_offer_badge === false) {
        processedData.offer_badge_text = null;
      }

      const updatedCourse = await CourseRepository.update(id, processedData, currentUserId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.COURSE_UPDATED,
        data: updatedCourse,
      };
    } catch (error) {
      console.error("Error in CourseService.updateCourse:", error);
      if (error.name === "SequelizeUniqueConstraintError") {
        return {
          success: false,
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          errors: { slug: "A course with similar title already exists" },
        };
      }
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Toggle course status
   */
  async toggleCourseStatus(id, currentUserId) {
    try {
      const course = await CourseRepository.findById(id);

      if (!course) {
        return {
          success: false,
          message: ERROR_MESSAGES.COURSE_NOT_FOUND,
        };
      }

      const newStatus = !course.is_active;
      await CourseRepository.update(id, { is_active: newStatus }, currentUserId);

      return {
        success: true,
        message: newStatus ? "Course activated successfully" : "Course deactivated successfully",
        data: { id, is_active: newStatus },
      };
    } catch (error) {
      console.error("Error in CourseService.toggleCourseStatus:", error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Delete course
   */
  async deleteCourse(id, currentUserId) {
    try {
      const course = await CourseRepository.findById(id);

      if (!course) {
        return {
          success: false,
          message: ERROR_MESSAGES.COURSE_NOT_FOUND,
        };
      }

      await CourseRepository.delete(id, currentUserId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.COURSE_DELETED,
        data: null,
      };
    } catch (error) {
      console.error("Error in CourseService.deleteCourse:", error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Get featured courses
   */
  async getFeaturedCourses(language = "en", limit = 6) {
    try {
      const courses = await CourseRepository.findFeatured(language, limit);

      // Calculate effective fee for each course
      const coursesWithEffectiveFee = courses.map((course) => {
        const courseData = course.toJSON();
        courseData.effective_fee =
          course.is_discounted && course.discounted_fee ? course.discounted_fee : course.original_fee;
        return courseData;
      });

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: coursesWithEffectiveFee,
      };
    } catch (error) {
      console.error("Error in CourseService.getFeaturedCourses:", error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Get course statistics
   */
  async getCourseStats(language = "en") {
    try {
      const stats = await CourseRepository.getStats(language);

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: stats,
      };
    } catch (error) {
      console.error("Error in CourseService.getCourseStats:", error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Reorder courses
   */
  async reorderCourses(coursesData, currentUserId) {
    if (!Array.isArray(coursesData) || coursesData.length === 0) {
      return {
        success: false,
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        errors: { courses: "Courses array is required" },
      };
    }

    try {
      console.log("Reached in service");
      await CourseRepository.updateDisplayOrders(coursesData, { currentUserId });

      return {
        success: true,
        message: "Course order updated successfully",
        data: null,
      };
    } catch (error) {
      console.error("Error in CourseService.reorderCourses:", error.message);
      return {
        success: false,
        message: error.message,
        errors: null,
      };
    }
  }
}

export default new CourseService();
