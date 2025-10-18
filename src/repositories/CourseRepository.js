import { Op } from "sequelize";
import { Course } from "../models/index.js";

class CourseRepository {
  /**
   * Get all courses with filtering and pagination
   */
  async findAll({
    page = 1,
    limit = 10,
    search = "",
    is_active,
    language,
    sortBy = "display_order",
    sortOrder = "ASC",
    includeInactive = true,
  }) {
    const offset = (page - 1) * limit;

    const whereClause = {};

    // Add search conditions
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { summary: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
      ];
    }

    // Add active status filter
    if (is_active !== undefined) {
      whereClause.is_active = is_active;
    }

    // Add language filter
    if (language) {
      whereClause.language = language;
    }

    // For public routes, only show active courses
    if (!includeInactive) {
      whereClause.is_active = true;
    }

    const { count, rows } = await Course.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      courses: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Find course by ID
   */
  async findById(id) {
    return await Course.findByPk(id);
  }

  /**
   * Find course by slug
   */
  async findBySlug(slug, activeOnly = false) {
    const whereClause = { slug };

    if (activeOnly) {
      whereClause.is_active = true;
    }

    return await Course.findOne({
      where: whereClause,
    });
  }

  async findByCourseGroupId(course_group_id) {
  return await Course.findAll({
    where: { course_group_id }
  });
}

  /**
   * Create new course
   */
  async create(courseData, currentUserId) {
    return await Course.create(courseData, {
      currentUserId,
    });
  }

  /**
   * Update course
   */
  async update(id, updateData, currentUserId) {
    const course = await this.findById(id);
    if (!course) {
      return null;
    }

    await course.update(updateData, {
      currentUserId,
    });

    return course;
  }

  /**
   * Delete course (soft delete)
   */
  async delete(id, currentUserId) {
    const course = await this.findById(id);
    if (!course) {
      return null;
    }

    await course.destroy({
      currentUserId,
    });

    return course;
  }

  /**
   * Get featured courses (courses with offer badges)
   */
  async findFeatured(language = "en", limit = 6) {
    return await Course.findAll({
      where: {
        is_active: true,
        language,
        show_offer_badge: true,
      },
      order: [["display_order", "ASC"]],
      limit: parseInt(limit),
    });
  }

  /**
   * Get course statistics
   */
  async getStats(language = "en") {
    const courses = await Course.findAll({
      where: {
        is_active: true,
        language,
      },
      attributes: [
        "base_course_fee",
        "discounted_course_fee",
        "total_fee",
        "duration",
        "is_discounted",
      ],
      raw: true,
    });

    const totalCourses = courses.length;
    let minFee = 0;
    let maxFee = 0;
    let avgDuration = 0;
    let discountedCourses = 0;

    if (totalCourses > 0) {
      const fees = courses.map((c) => parseFloat(c.base_course_fee));
      const durations = courses.map((d) => parseInt(d.duration));

      minFee = Math.min(...fees);
      maxFee = Math.max(...fees);
      avgDuration = Math.round(
        durations.reduce((sum, d) => sum + d, 0) / durations.length
      );
      discountedCourses = courses.filter((c) => c.is_discounted).length;
    }

    return {
      total_courses: totalCourses,
      min_fee: minFee,
      max_fee: maxFee,
      avg_duration: avgDuration,
      discounted_courses: discountedCourses,
    };
  }

  /**
   * Update display order for multiple courses
   */
async updateDisplayOrders(coursesData, options = {}) {
  console.log("Reached in repository")
  const updates = coursesData.map(course =>
    Course.update(
      { display_order: parseInt(course.display_order) },
      {
        where: { id: course.id, is_deleted: false },
        ...options,
      }
    )
  );

  return await Promise.all(updates);
}


  /**
   * Check if slug exists (for uniqueness validation)
   */
  async slugExists(slug, excludeId = null) {
    const whereClause = { slug };

    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const course = await Course.findOne({
      where: whereClause,
      attributes: ["id"],
    });

    return !!course;
  }
}

export default new CourseRepository();
