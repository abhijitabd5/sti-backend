// src/controllers/internal/PageController.js
import PageService from '../../services/PageService.js';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  createResponse,
  notFoundResponse,
  validationErrorResponse
} from '../../utils/responseFormatter.js';

class PageController {
  /**
   * GET /api/internal/pages
   * Get all pages with filtering and pagination
   */
  static async getAllPages(req, res) {
    try {
      const filters = {
        language: req.query.language,
        search: req.query.search,
        limit: parseInt(req.query.limit) || 10,
        offset: parseInt(req.query.offset) || 0,
        orderBy: req.query.orderBy || 'createdAt',
        orderDirection: req.query.orderDirection || 'DESC'
      };

      const result = await PageService.getAllPages(filters, req.user.id);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return paginatedResponse(res, result.data, result.pagination, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * GET /api/internal/pages/:id
   * Get single page by ID with contents
   */
  static async getPageById(req, res) {
    try {
      const { id } = req.params;
      const includeContents = req.query.includeContents !== 'false';

      const result = await PageService.getPageById(id, includeContents);

      if (!result.success) {
        return notFoundResponse(res, result.message);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * GET /api/internal/pages/slug/:slug
   * Get page by slug with optional language filter
   */
  static async getPageBySlug(req, res) {
    try {
      const { slug } = req.params;
      const language = req.query.language;
      const includeContents = req.query.includeContents !== 'false';

      const result = await PageService.getPageBySlug(slug, language, includeContents);

      if (!result.success) {
        return notFoundResponse(res, result.message);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * POST /api/internal/pages
   * Create a new page
   */
  static async createPage(req, res) {
    try {
      // Validate required fields
      const validation = PageService.validatePageData(req.body);
      if (!validation.isValid) {
        return validationErrorResponse(res, 'Validation failed', validation.errors);
      }

      const result = await PageService.createPage(req.body, req.user.id);

      if (!result.success) {
        if (result.errors) {
          return validationErrorResponse(res, result.message, result.errors);
        }
        return errorResponse(res, result.message, 400);
      }

      return createResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * PUT /api/internal/pages/:id
   * Update a page
   */
  static async updatePage(req, res) {
    try {
      const { id } = req.params;

      // Validate update data
      const validation = PageService.validatePageData(req.body, true);
      if (!validation.isValid) {
        return validationErrorResponse(res, 'Validation failed', validation.errors);
      }

      const result = await PageService.updatePage(id, req.body, req.user.id);

      if (!result.success) {
        if (result.message.includes('not found')) {
          return notFoundResponse(res, result.message);
        }
        if (result.errors) {
          return validationErrorResponse(res, result.message, result.errors);
        }
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * DELETE /api/internal/pages/:id
   * Delete a page (soft delete)
   */
  static async deletePage(req, res) {
    try {
      const { id } = req.params;

      const result = await PageService.deletePage(id, req.user.id);

      if (!result.success) {
        return notFoundResponse(res, result.message);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * GET /api/internal/pages/language/:language
   * Get pages by language
   */
  static async getPagesByLanguage(req, res) {
    try {
      const { language } = req.params;

      // Validate language
      const validLanguages = ['en', 'hi', 'mar'];
      if (!validLanguages.includes(language)) {
        return errorResponse(res, 'Invalid language. Must be one of: en, hi, mar', 400);
      }

      const result = await PageService.getPagesByLanguage(language);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * GET /api/internal/pages/statistics
   * Get page statistics
   */
  static async getPageStatistics(req, res) {
    try {
      const result = await PageService.getPageStatistics();

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * POST /api/internal/pages/:id/duplicate
   * Duplicate a page with optional language change
   */
  static async duplicatePage(req, res) {
    try {
      const { id } = req.params;
      const { name, language, slug } = req.body;

      // Get the original page
      const originalResult = await PageService.getPageById(id, false);
      if (!originalResult.success) {
        return notFoundResponse(res, 'Original page not found');
      }

      const originalPage = originalResult.data;

      // Create duplicate data
      const duplicateData = {
        name: name || `${originalPage.name} (Copy)`,
        slug: slug || `${originalPage.slug}-copy`,
        language: language || originalPage.language,
        page_title: originalPage.page_title,
        meta_title: originalPage.meta_title,
        meta_description: originalPage.meta_description,
        meta_keywords: originalPage.meta_keywords
      };

      const result = await PageService.createPage(duplicateData, req.user.id);

      if (!result.success) {
        if (result.errors) {
          return validationErrorResponse(res, result.message, result.errors);
        }
        return errorResponse(res, result.message, 400);
      }

      return createResponse(res, result.data, 'Page duplicated successfully');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}

export default PageController;