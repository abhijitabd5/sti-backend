// src/services/PageService.js
import PageRepository from '../repositories/PageRepository.js';
import { generateSlug, createUniqueSlug } from '../utils/customSlugify.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants/messages.js';

class PageService {
  async getAllPages(filters, currentUserId) {
    try {
      const result = await PageRepository.findAll(filters);
      
      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: result.pages,
        pagination: {
          page: Math.floor(result.offset / result.limit) + 1,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
          hasNext: result.offset + result.limit < result.total,
          hasPrev: result.offset > 0
        }
      };
    } catch (error) {
      throw new Error(`Failed to retrieve pages: ${error.message}`);
    }
  }

  async getPageById(id, includeContents = true) {
    try {
      const page = await PageRepository.findById(id, includeContents);
      
      if (!page) {
        return {
          success: false,
          message: ERROR_MESSAGES.NOT_FOUND.replace(':resource', 'Page'),
          data: null
        };
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: page
      };
    } catch (error) {
      throw new Error(`Failed to retrieve page: ${error.message}`);
    }
  }

  async getPageBySlug(slug, language = null, includeContents = true) {
    try {
      const page = await PageRepository.findBySlug(slug, language, includeContents);
      
      if (!page) {
        return {
          success: false,
          message: ERROR_MESSAGES.NOT_FOUND.replace(':resource', 'Page'),
          data: null
        };
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: page
      };
    } catch (error) {
      throw new Error(`Failed to retrieve page: ${error.message}`);
    }
  }

  async createPage(pageData, currentUserId) {
    try {
      // Validate required fields
      const { name, language } = pageData;
      if (!name || !language) {
        return {
          success: false,
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          errors: {
            name: !name ? 'Page name is required' : null,
            language: !language ? 'Language is required' : null
          }
        };
      }

      // Generate slug if not provided
      let slug = pageData.slug;
      if (!slug) {
        slug = generateSlug(name);
      } else {
        slug = generateSlug(slug);
      }

      // Ensure unique slug for the language
      const isSlugExists = await PageRepository.checkSlugExists(slug, language);
      if (isSlugExists) {
        slug = await createUniqueSlug(slug, 'Page', { language });
      }

      const newPageData = {
        ...pageData,
        slug
      };

      const page = await PageRepository.create(newPageData, currentUserId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.CREATED.replace(':resource', 'Page'),
        data: page
      };
    } catch (error) {
      throw new Error(`Failed to create page: ${error.message}`);
    }
  }

  async updatePage(id, updateData, currentUserId) {
    try {
      // Check if page exists
      const existingPage = await PageRepository.findById(id, false);
      if (!existingPage) {
        return {
          success: false,
          message: ERROR_MESSAGES.NOT_FOUND.replace(':resource', 'Page'),
          data: null
        };
      }

      // Handle slug update if name or slug is being changed
      if (updateData.name || updateData.slug) {
        let newSlug;
        if (updateData.slug) {
          newSlug = generateSlug(updateData.slug);
        } else if (updateData.name) {
          newSlug = generateSlug(updateData.name);
        }

        if (newSlug && newSlug !== existingPage.slug) {
          const language = updateData.language || existingPage.language;
          const isSlugExists = await PageRepository.checkSlugExists(newSlug, language, id);
          if (isSlugExists) {
            newSlug = await createUniqueSlug(newSlug, 'Page', { language }, id);
          }
          updateData.slug = newSlug;
        }
      }

      const updatedPage = await PageRepository.update(id, updateData, currentUserId);
      
      if (!updatedPage) {
        return {
          success: false,
          message: ERROR_MESSAGES.UPDATE_FAILED.replace(':resource', 'Page'),
          data: null
        };
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.UPDATED.replace(':resource', 'Page'),
        data: updatedPage
      };
    } catch (error) {
      throw new Error(`Failed to update page: ${error.message}`);
    }
  }

  async deletePage(id, currentUserId) {
    try {
      const deletedPage = await PageRepository.delete(id, currentUserId);
      
      if (!deletedPage) {
        return {
          success: false,
          message: ERROR_MESSAGES.NOT_FOUND.replace(':resource', 'Page'),
          data: null
        };
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.DELETED.replace(':resource', 'Page'),
        data: { id }
      };
    } catch (error) {
      throw new Error(`Failed to delete page: ${error.message}`);
    }
  }

  async getPagesByLanguage(language) {
    try {
      const pages = await PageRepository.getPagesByLanguage(language);

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: pages
      };
    } catch (error) {
      throw new Error(`Failed to retrieve pages by language: ${error.message}`);
    }
  }

  async getPageStatistics() {
    try {
      const statistics = await PageRepository.getPageStatistics();

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: statistics
      };
    } catch (error) {
      throw new Error(`Failed to retrieve page statistics: ${error.message}`);
    }
  }

  async validatePageData(pageData, isUpdate = false) {
    const errors = {};

    // Name validation
    if (!isUpdate && !pageData.name) {
      errors.name = 'Page name is required';
    } else if (pageData.name && (typeof pageData.name !== 'string' || pageData.name.trim().length < 2)) {
      errors.name = 'Page name must be at least 2 characters long';
    }

    // Language validation
    const validLanguages = ['en', 'hi', 'mar'];
    if (!isUpdate && !pageData.language) {
      errors.language = 'Language is required';
    } else if (pageData.language && !validLanguages.includes(pageData.language)) {
      errors.language = 'Language must be one of: en, hi, mar';
    }

    // Slug validation (if provided)
    if (pageData.slug) {
      if (typeof pageData.slug !== 'string' || pageData.slug.trim().length < 2) {
        errors.slug = 'Slug must be at least 2 characters long';
      }
      // Check for valid slug format
      const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugPattern.test(pageData.slug)) {
        errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
      }
    }

    // Meta fields validation
    if (pageData.meta_title && pageData.meta_title.length > 60) {
      errors.meta_title = 'Meta title should not exceed 60 characters';
    }

    if (pageData.meta_description && pageData.meta_description.length > 160) {
      errors.meta_description = 'Meta description should not exceed 160 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export default new PageService();