import CourseRepository from '../repositories/CourseRepository.js';
import { generateSlug } from '../utils/slugify.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants/messages.js';

class CourseService {
  /**
   * Get all courses for internal management
   */
  async getAllCourses(filters, currentUserId) {
    try {
      const result = await CourseRepository.findAll({
        ...filters,
        includeInactive: true // Internal routes can see inactive courses
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
          hasPrev: result.page > 1
        }
      };
    } catch (error) {
      console.error('Error in CourseService.getAllCourses:', error);
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
        includeInactive: false // Public routes only show active courses
      });

      // Calculate effective fee for each course
      const coursesWithEffectiveFee = result.courses.map(course => {
        const courseData = course.toJSON();
        courseData.effective_fee = course.is_discounted && course.discounted_fee 
          ? course.discounted_fee 
          : course.original_fee;
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
          hasPrev: result.page > 1
        }
      };
    } catch (error) {
      console.error('Error in CourseService.getPublicCourses:', error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Get course by ID
   */
  async getCourseById(id, currentUserId) {
    try {
      const course = await CourseRepository.findById(id);
      
      if (!course) {
        return {
          success: false,
          message: ERROR_MESSAGES.COURSE_NOT_FOUND
        };
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: course
      };
    } catch (error) {
      console.error('Error in CourseService.getCourseById:', error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Get course by slug (public)
   */
  async getCourseBySlug(slug) {
    try {
      const course = await CourseRepository.findBySlug(slug, true); // activeOnly = true
      
      if (!course) {
        return {
          success: false,
          message: ERROR_MESSAGES.COURSE_NOT_FOUND
        };
      }

      const courseData = course.toJSON();
      courseData.effective_fee = course.is_discounted && course.discounted_fee 
        ? course.discounted_fee 
        : course.original_fee;

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: courseData
      };
    } catch (error) {
      console.error('Error in CourseService.getCourseBySlug:', error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Create new course
   */
  async createCourse(courseData, currentUserId) {
    try {
      // Validate required fields
      const requiredFields = ['title', 'summary', 'description', 'duration', 'original_fee'];
      const missingFields = {};

      requiredFields.forEach(field => {
        if (!courseData[field]) {
          missingFields[field] = `${field.replace('_', ' ')} is required`;
        }
      });

      if (Object.keys(missingFields).length > 0) {
        return {
          success: false,
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          errors: missingFields
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

      // Prepare course data
      const processedData = {
        ...courseData,
        slug,
        duration: parseInt(courseData.duration),
        original_fee: parseFloat(courseData.original_fee),
        discounted_fee: courseData.is_discounted ? parseFloat(courseData.discounted_fee) : null,
        discount_percentage: courseData.is_discounted ? parseFloat(courseData.discount_percentage) : null,
        offer_badge_text: courseData.show_offer_badge ? courseData.offer_badge_text : null,
        display_order: parseInt(courseData.display_order || 0)
      };

      const course = await CourseRepository.create(processedData, currentUserId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.COURSE_CREATED,
        data: course
      };
    } catch (error) {
      console.error('Error in CourseService.createCourse:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return {
          success: false,
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          errors: { slug: 'A course with similar title already exists' }
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
          message: ERROR_MESSAGES.COURSE_NOT_FOUND
        };
      }

      // Process update data
      const processedData = { ...updateData };

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

      // Process numeric fields
      if (updateData.duration !== undefined) {
        processedData.duration = parseInt(updateData.duration);
      }
      if (updateData.original_fee !== undefined) {
        processedData.original_fee = parseFloat(updateData.original_fee);
      }
      if (updateData.discounted_fee !== undefined) {
        processedData.discounted_fee = processedData.is_discounted !== false 
          ? parseFloat(updateData.discounted_fee) 
          : null;
      }
      if (updateData.discount_percentage !== undefined) {
        processedData.discount_percentage = processedData.is_discounted !== false 
          ? parseFloat(updateData.discount_percentage) 
          : null;
      }
      if (updateData.display_order !== undefined) {
        processedData.display_order = parseInt(updateData.display_order);
      }

      // Handle offer badge
      if (updateData.show_offer_badge === false) {
        processedData.offer_badge_text = null;
      }

      // Handle discount
      if (updateData.is_discounted === false) {
        processedData.discounted_fee = null;
        processedData.discount_percentage = null;
      }

      const updatedCourse = await CourseRepository.update(id, processedData, currentUserId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.COURSE_UPDATED,
        data: updatedCourse
      };
    } catch (error) {
      console.error('Error in CourseService.updateCourse:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return {
          success: false,
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          errors: { slug: 'A course with similar title already exists' }
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
          message: ERROR_MESSAGES.COURSE_NOT_FOUND
        };
      }

      const newStatus = !course.is_active;
      await CourseRepository.update(id, { is_active: newStatus }, currentUserId);

      return {
        success: true,
        message: newStatus ? 'Course activated successfully' : 'Course deactivated successfully',
        data: { id, is_active: newStatus }
      };
    } catch (error) {
      console.error('Error in CourseService.toggleCourseStatus:', error);
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
          message: ERROR_MESSAGES.COURSE_NOT_FOUND
        };
      }

      await CourseRepository.delete(id, currentUserId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.COURSE_DELETED,
        data: null
      };
    } catch (error) {
      console.error('Error in CourseService.deleteCourse:', error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Get featured courses
   */
  async getFeaturedCourses(language = 'en', limit = 6) {
    try {
      const courses = await CourseRepository.findFeatured(language, limit);

      // Calculate effective fee for each course
      const coursesWithEffectiveFee = courses.map(course => {
        const courseData = course.toJSON();
        courseData.effective_fee = course.is_discounted && course.discounted_fee 
          ? course.discounted_fee 
          : course.original_fee;
        return courseData;
      });

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: coursesWithEffectiveFee
      };
    } catch (error) {
      console.error('Error in CourseService.getFeaturedCourses:', error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Get course statistics
   */
  async getCourseStats(language = 'en') {
    try {
      const stats = await CourseRepository.getStats(language);

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: stats
      };
    } catch (error) {
      console.error('Error in CourseService.getCourseStats:', error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Reorder courses
   */
  async reorderCourses(coursesData, currentUserId) {
    try {
      if (!Array.isArray(coursesData)) {
        return {
          success: false,
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          errors: { courses: 'Courses array is required' }
        };
      }

      await CourseRepository.updateDisplayOrders(coursesData, currentUserId);

      return {
        success: true,
        message: 'Course order updated successfully',
        data: null
      };
    } catch (error) {
      console.error('Error in CourseService.reorderCourses:', error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }
}

export default new CourseService();
