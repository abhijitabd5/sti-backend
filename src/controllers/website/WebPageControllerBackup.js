// src/controllers/website/WebPageController.js
import PageService from '../../services/PageService.js';
import {
  successResponse,
  errorResponse,
  notFoundResponse
} from '../../utils/responseFormatter.js';

class WebPageController {
  /**
   * GET /api/public/pages
   * Get all active pages for public display
   */
  static async getAllPages(req, res) {
    try {
      const filters = {
        language: req.query.language || 'en',
        search: req.query.search,
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0,
        orderBy: req.query.orderBy || 'name',
        orderDirection: req.query.orderDirection || 'ASC'
      };

      const result = await PageService.getAllPages(filters);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      // Filter out sensitive data for public API
      const publicData = result.data.map(page => ({
        id: page.id,
        name: page.name,
        slug: page.slug,
        language: page.language,
        page_title: page.page_title,
        meta_title: page.meta_title,
        meta_description: page.meta_description,
        meta_keywords: page.meta_keywords,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt
      }));

      return successResponse(res, publicData, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to retrieve pages', 500);
    }
  }

  /**
   * GET /api/public/pages/:slug
   * Get page by slug with all content for public display
   */
  static async getPageBySlug(req, res) {
    try {
      const { slug } = req.params;
      const language = req.query.language || 'en';

      const result = await PageService.getPageBySlug(slug, language, true);

      if (!result.success) {
        return notFoundResponse(res, 'Page not found');
      }

      // Filter out sensitive data and format for public display
      const publicData = {
        id: result.data.id,
        name: result.data.name,
        slug: result.data.slug,
        language: result.data.language,
        page_title: result.data.page_title,
        meta_title: result.data.meta_title,
        meta_description: result.data.meta_description,
        meta_keywords: result.data.meta_keywords,
        contents: result.data.contents ? result.data.contents.map(content => ({
          section_key: content.section_key,
          section_name: content.section_name,
          language: content.language,
          title: content.title,
          subtitle: content.subtitle,
          content: content.content
        })) : [],
        createdAt: result.data.createdAt,
        updatedAt: result.data.updatedAt
      };

      return successResponse(res, publicData, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to retrieve page', 500);
    }
  }

  /**
   * GET /api/public/pages/language/:language
   * Get pages by language for navigation/menu
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

      // Format for public navigation
      const publicData = result.data.map(page => ({
        id: page.id,
        name: page.name,
        slug: page.slug,
        page_title: page.page_title
      }));

      return successResponse(res, publicData, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to retrieve pages', 500);
    }
  }

  /**
   * GET /api/public/pages/sitemap
   * Get all pages for sitemap generation
   */
  static async getSitemap(req, res) {
    try {
      const filters = {
        limit: 1000, // Get all pages
        offset: 0,
        orderBy: 'slug',
        orderDirection: 'ASC'
      };

      const result = await PageService.getAllPages(filters);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      // Format for sitemap
      const sitemapData = result.data.map(page => ({
        slug: page.slug,
        language: page.language,
        updatedAt: page.updatedAt
      }));

      return successResponse(res, sitemapData, 'Sitemap data retrieved successfully');
    } catch (error) {
      return errorResponse(res, 'Failed to retrieve sitemap data', 500);
    }
  }

  /**
   * GET /api/public/pages/:slug/content/:sectionKey
   * Get specific section content for a page
   */
  static async getPageSectionContent(req, res) {
    try {
      const { slug, sectionKey } = req.params;
      const language = req.query.language || 'en';

      // First get the page
      const pageResult = await PageService.getPageBySlug(slug, language, true);
      if (!pageResult.success) {
        return notFoundResponse(res, 'Page not found');
      }

      // Find the specific section content
      const sectionContent = pageResult.data.contents?.find(
        content => content.section_key === sectionKey && content.language === language
      );

      if (!sectionContent) {
        return notFoundResponse(res, 'Section content not found');
      }

      // Format for public display
      const publicData = {
        section_key: sectionContent.section_key,
        section_name: sectionContent.section_name,
        language: sectionContent.language,
        title: sectionContent.title,
        subtitle: sectionContent.subtitle,
        content: sectionContent.content,
        page: {
          name: pageResult.data.name,
          slug: pageResult.data.slug
        }
      };

      return successResponse(res, publicData, 'Section content retrieved successfully');
    } catch (error) {
      return errorResponse(res, 'Failed to retrieve section content', 500);
    }
  }

  /**
   * GET /api/public/pages/search
   * Search pages and content
   */
  static async searchPages(req, res) {
    try {
      const { q: search, language } = req.query;

      if (!search || search.trim().length < 3) {
        return errorResponse(res, 'Search query must be at least 3 characters long', 400);
      }

      const filters = {
        search: search.trim(),
        language: language || 'en',
        limit: parseInt(req.query.limit) || 20,
        offset: parseInt(req.query.offset) || 0,
        orderBy: 'name',
        orderDirection: 'ASC'
      };

      const result = await PageService.getAllPages(filters);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      // Format search results for public display
      const searchResults = result.data.map(page => ({
        id: page.id,
        name: page.name,
        slug: page.slug,
        language: page.language,
        page_title: page.page_title,
        meta_description: page.meta_description,
        // Include a snippet of content if available
        contentSnippet: page.contents && page.contents.length > 0 
          ? page.contents[0].content.substring(0, 150) + '...'
          : null
      }));

      return successResponse(res, searchResults, `Found ${result.pagination.total} pages`);
    } catch (error) {
      return errorResponse(res, 'Search failed', 500);
    }
  }

  /**
   * GET /api/public/pages/menu/:language
   * Get pages formatted for website menu/navigation
   */
  static async getMenuPages(req, res) {
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

      // Format for menu structure
      const menuData = result.data.map(page => ({
        name: page.name,
        slug: page.slug,
        title: page.page_title || page.name,
        url: `/pages/${page.slug}`
      }));

      return successResponse(res, menuData, 'Menu pages retrieved successfully');
    } catch (error) {
      return errorResponse(res, 'Failed to retrieve menu pages', 500);
    }
  }
}

export default WebPageController;