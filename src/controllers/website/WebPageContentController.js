// src/controllers/website/WebPageContentController.js
import PageContentService from '../../services/PageContentService.js';
import {
  successResponse,
  errorResponse,
  notFoundResponse
} from '../../utils/responseFormatter.js';

class WebPageContentController {
  /**
   * GET /api/public/page-contents/page/:pageSlug
   * Get all contents for a page by slug
   */
  static async getContentsByPageSlug(req, res) {
    try {
      const { pageSlug } = req.params;
      const language = req.query.language || 'en';

      const result = await PageContentService.getContentsByPageSlug(pageSlug, language);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      // Filter out sensitive data for public API
      const publicData = result.data.map(content => ({
        section_key: content.section_key,
        section_name: content.section_name,
        language: content.language,
        title: content.title,
        subtitle: content.subtitle,
        content: content.content,
        page: content.page ? {
          name: content.page.name,
          slug: content.page.slug
        } : null
      }));

      return successResponse(res, publicData, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to retrieve page contents', 500);
    }
  }

  /**
   * GET /api/public/page-contents/page/:pageSlug/section/:sectionKey
   * Get specific section content for a page
   */
  static async getPageSectionContent(req, res) {
    try {
      const { pageSlug, sectionKey } = req.params;
      const language = req.query.language || 'en';

      const result = await PageContentService.getContentsByPageSlug(pageSlug, language, sectionKey);

      if (!result.success || result.data.length === 0) {
        return notFoundResponse(res, 'Section content not found');
      }

      // Get the specific content for the language
      const sectionContent = result.data.find(content => 
        content.section_key === sectionKey && content.language === language
      ) || result.data[0]; // Fallback to first available if language not found

      // Format for public display
      const publicData = {
        section_key: sectionContent.section_key,
        section_name: sectionContent.section_name,
        language: sectionContent.language,
        title: sectionContent.title,
        subtitle: sectionContent.subtitle,
        content: sectionContent.content,
        page: sectionContent.page ? {
          name: sectionContent.page.name,
          slug: sectionContent.page.slug
        } : null
      };

      return successResponse(res, publicData, 'Section content retrieved successfully');
    } catch (error) {
      return errorResponse(res, 'Failed to retrieve section content', 500);
    }
  }
}

export default WebPageContentController;