// src/controllers/internal/PageContentController.js
import PageContentService from '../../services/PageContentService.js';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  createResponse,
  notFoundResponse,
  validationErrorResponse
} from '../../utils/responseFormatter.js';

class PageContentController {
  /**
   * GET /api/internal/page-contents
   * Get all page contents with filtering and pagination
   */
  static async getAllContents(req, res) {
    try {
      const filters = {
        pageId: req.query.pageId,
        language: req.query.language,
        sectionKey: req.query.sectionKey,
        search: req.query.search,
        limit: parseInt(req.query.limit) || 10,
        offset: parseInt(req.query.offset) || 0,
        orderBy: req.query.orderBy || 'createdAt',
        orderDirection: req.query.orderDirection || 'DESC'
      };

      const result = await PageContentService.getAllContents(filters, req.user.id);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return paginatedResponse(res, result.data, result.pagination, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * GET /api/internal/page-contents/:id
   * Get single page content by ID
   */
  static async getContentById(req, res) {
    try {
      const { id } = req.params;
      const includePage = req.query.includePage !== 'false';

      const result = await PageContentService.getContentById(id, includePage);

      if (!result.success) {
        return notFoundResponse(res, result.message);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * GET /api/internal/page-contents/page/:pageId
   * Get all contents for a specific page
   */
  static async getContentsByPage(req, res) {
    try {
      const { pageId } = req.params;
      const language = req.query.language;

      const result = await PageContentService.getContentsByPage(pageId, language);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * GET /api/internal/page-contents/page/:pageId/section/:sectionKey
   * Get contents for a specific page section
   */
  static async getContentsBySection(req, res) {
    try {
      const { pageId, sectionKey } = req.params;
      const language = req.query.language;

      const result = await PageContentService.getContentsBySection(pageId, sectionKey, language);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * POST /api/internal/page-contents
   * Create new page content
   */
  static async createContent(req, res) {
    try {
      const result = await PageContentService.createContent(req.body, req.user.id);

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
   * PUT /api/internal/page-contents/:id
   * Update page content
   */
  static async updateContent(req, res) {
    try {
      const { id } = req.params;

      const result = await PageContentService.updateContent(id, req.body, req.user.id);

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
   * DELETE /api/internal/page-contents/:id
   * Delete page content (soft delete)
   */
  static async deleteContent(req, res) {
    try {
      const { id } = req.params;

      const result = await PageContentService.deleteContent(id, req.user.id);

      if (!result.success) {
        return notFoundResponse(res, result.message);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * POST /api/internal/page-contents/bulk
   * Bulk create page contents
   */
  static async bulkCreateContents(req, res) {
    try {
      const { contents } = req.body;

      if (!Array.isArray(contents) || contents.length === 0) {
        return validationErrorResponse(res, 'Validation failed', {
          contents: 'Contents array is required and must not be empty'
        });
      }

      const result = await PageContentService.bulkCreateContents(contents, req.user.id);

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
   * GET /api/internal/page-contents/page/:pageId/sections
   * Get all section keys for a page
   */
  static async getSectionKeys(req, res) {
    try {
      const { pageId } = req.params;

      const result = await PageContentService.getSectionKeys(pageId);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * GET /api/internal/page-contents/statistics
   * Get page content statistics
   */
  static async getContentStatistics(req, res) {
    try {
      const result = await PageContentService.getContentStatistics();

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * DELETE /api/internal/page-contents/page/:pageId
   * Delete all contents for a specific page
   */
  static async deleteContentsByPage(req, res) {
    try {
      const { pageId } = req.params;

      const result = await PageContentService.deleteContentsByPage(pageId, req.user.id);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * POST /api/internal/page-contents/:id/duplicate
   * Duplicate content with optional language change
   */
  static async duplicateContent(req, res) {
    try {
      const { id } = req.params;
      const { language, section_key, page_id } = req.body;

      // Get the original content
      const originalResult = await PageContentService.getContentById(id, false);
      if (!originalResult.success) {
        return notFoundResponse(res, 'Original content not found');
      }

      const originalContent = originalResult.data;

      // Create duplicate data
      const duplicateData = {
        page_id: page_id || originalContent.page_id,
        section_key: section_key || originalContent.section_key,
        section_name: originalContent.section_name,
        language: language || originalContent.language,
        title: originalContent.title,
        subtitle: originalContent.subtitle,
        content: originalContent.content
      };

      const result = await PageContentService.createContent(duplicateData, req.user.id);

      if (!result.success) {
        if (result.errors) {
          return validationErrorResponse(res, result.message, result.errors);
        }
        return errorResponse(res, result.message, 400);
      }

      return createResponse(res, result.data, 'Content duplicated successfully');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * PUT /api/internal/page-contents/reorder
   * Reorder page contents (if display_order field exists)
   */
  static async reorderContents(req, res) {
    try {
      const { contentOrders } = req.body; // Array of {id, order} objects

      if (!Array.isArray(contentOrders) || contentOrders.length === 0) {
        return validationErrorResponse(res, 'Validation failed', {
          contentOrders: 'Content orders array is required and must not be empty'
        });
      }

      // Validate each order object
      for (const order of contentOrders) {
        if (!order.id || typeof order.order !== 'number') {
          return validationErrorResponse(res, 'Validation failed', {
            contentOrders: 'Each order object must have id and numeric order'
          });
        }
      }

      const updatePromises = contentOrders.map(({ id, order }) =>
        PageContentService.updateContent(id, { display_order: order }, req.user.id)
      );

      const results = await Promise.all(updatePromises);

      const failedUpdates = results.filter(result => !result.success);
      if (failedUpdates.length > 0) {
        return errorResponse(res, `Failed to update ${failedUpdates.length} contents`, 400);
      }

      return successResponse(res, { updated: results.length }, 'Contents reordered successfully');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}

export default PageContentController;