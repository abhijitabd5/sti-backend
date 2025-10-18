// src/services/PageContentService.js
import PageContentRepository from '../repositories/PageContentRepository.js';
import PageRepository from '../repositories/PageRepository.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants/messages.js';

class PageContentService {
  async getAllContents(filters, currentUserId) {
    try {
      const result = await PageContentRepository.findAll(filters);
      
      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: result.contents,
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
      throw new Error(`Failed to retrieve page contents: ${error.message}`);
    }
  }

  async getContentById(id, includePage = true) {
    try {
      const content = await PageContentRepository.findById(id, includePage);
      
      if (!content) {
        return {
          success: false,
          message: ERROR_MESSAGES.NOT_FOUND.replace(':resource', 'Page content'),
          data: null
        };
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: content
      };
    } catch (error) {
      throw new Error(`Failed to retrieve page content: ${error.message}`);
    }
  }

  async getContentsByPage(pageId, language = null) {
    try {
      const contents = await PageContentRepository.getContentsByPage(pageId, language);

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: contents
      };
    } catch (error) {
      throw new Error(`Failed to retrieve page contents: ${error.message}`);
    }
  }

  async getContentsByPageSlug(pageSlug, language = null, sectionKey = null) {
    try {
      const contents = await PageContentRepository.findByPageSlug(pageSlug, language, sectionKey);

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: contents
      };
    } catch (error) {
      throw new Error(`Failed to retrieve page contents: ${error.message}`);
    }
  }

  async getContentsBySection(pageId, sectionKey, language = null) {
    try {
      const contents = await PageContentRepository.findByPageAndSection(pageId, sectionKey, language);

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: contents
      };
    } catch (error) {
      throw new Error(`Failed to retrieve section contents: ${error.message}`);
    }
  }

  async createContent(contentData, currentUserId) {
    try {
      // Validate required fields
      const validation = await this.validateContentData(contentData);
      if (!validation.isValid) {
        return {
          success: false,
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          errors: validation.errors
        };
      }

      // Check if page exists
      const page = await PageRepository.findById(contentData.page_id, false);
      if (!page) {
        return {
          success: false,
          message: ERROR_MESSAGES.NOT_FOUND.replace(':resource', 'Page'),
          errors: { page_id: 'Referenced page does not exist' }
        };
      }

      // Check for duplicate content (same page, section, and language)
      const isDuplicate = await PageContentRepository.checkDuplicateContent(
        contentData.page_id,
        contentData.section_key,
        contentData.language
      );

      if (isDuplicate) {
        return {
          success: false,
          message: 'Content already exists for this page, section, and language combination',
          errors: { duplicate: 'This content combination already exists' }
        };
      }

      // Add page_name from the page
      const newContentData = {
        ...contentData,
        page_name: page.name
      };

      const content = await PageContentRepository.create(newContentData, currentUserId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.CREATED.replace(':resource', 'Page content'),
        data: content
      };
    } catch (error) {
      throw new Error(`Failed to create page content: ${error.message}`);
    }
  }

  async updateContent(id, updateData, currentUserId) {
    try {
      // Check if content exists
      const existingContent = await PageContentRepository.findById(id, false);
      if (!existingContent) {
        return {
          success: false,
          message: ERROR_MESSAGES.NOT_FOUND.replace(':resource', 'Page content'),
          data: null
        };
      }

      // Validate update data
      const validation = await this.validateContentData(updateData, true);
      if (!validation.isValid) {
        return {
          success: false,
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          errors: validation.errors
        };
      }

      // If page_id is being updated, validate the new page exists
      if (updateData.page_id && updateData.page_id !== existingContent.page_id) {
        const page = await PageRepository.findById(updateData.page_id, false);
        if (!page) {
          return {
            success: false,
            message: ERROR_MESSAGES.NOT_FOUND.replace(':resource', 'Page'),
            errors: { page_id: 'Referenced page does not exist' }
          };
        }
        updateData.page_name = page.name;
      }

      // Check for duplicate content if key fields are being changed
      if (updateData.page_id || updateData.section_key || updateData.language) {
        const pageId = updateData.page_id || existingContent.page_id;
        const sectionKey = updateData.section_key || existingContent.section_key;
        const language = updateData.language || existingContent.language;

        const isDuplicate = await PageContentRepository.checkDuplicateContent(
          pageId,
          sectionKey,
          language,
          id
        );

        if (isDuplicate) {
          return {
            success: false,
            message: 'Content already exists for this page, section, and language combination',
            errors: { duplicate: 'This content combination already exists' }
          };
        }
      }

      const updatedContent = await PageContentRepository.update(id, updateData, currentUserId);
      
      if (!updatedContent) {
        return {
          success: false,
          message: ERROR_MESSAGES.UPDATE_FAILED.replace(':resource', 'Page content'),
          data: null
        };
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.UPDATED.replace(':resource', 'Page content'),
        data: updatedContent
      };
    } catch (error) {
      throw new Error(`Failed to update page content: ${error.message}`);
    }
  }

  async deleteContent(id, currentUserId) {
    try {
      const deletedContent = await PageContentRepository.delete(id, currentUserId);
      
      if (!deletedContent) {
        return {
          success: false,
          message: ERROR_MESSAGES.NOT_FOUND.replace(':resource', 'Page content'),
          data: null
        };
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.DELETED.replace(':resource', 'Page content'),
        data: { id }
      };
    } catch (error) {
      throw new Error(`Failed to delete page content: ${error.message}`);
    }
  }

  async bulkCreateContents(contentsData, currentUserId) {
    try {
      // Validate all contents
      for (const contentData of contentsData) {
        const validation = await this.validateContentData(contentData);
        if (!validation.isValid) {
          return {
            success: false,
            message: `Validation failed for content: ${JSON.stringify(validation.errors)}`,
            errors: validation.errors
          };
        }
      }

      // Add page_name to each content
      for (const contentData of contentsData) {
        const page = await PageRepository.findById(contentData.page_id, false);
        if (!page) {
          return {
            success: false,
            message: ERROR_MESSAGES.NOT_FOUND.replace(':resource', 'Page'),
            errors: { page_id: `Page with ID ${contentData.page_id} does not exist` }
          };
        }
        contentData.page_name = page.name;
      }

      const contents = await PageContentRepository.bulkCreate(contentsData, currentUserId);

      return {
        success: true,
        message: `Successfully created ${contents.length} page contents`,
        data: contents
      };
    } catch (error) {
      throw new Error(`Failed to bulk create page contents: ${error.message}`);
    }
  }

  async getSectionKeys(pageId) {
    try {
      const sections = await PageContentRepository.getSectionKeys(pageId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: sections
      };
    } catch (error) {
      throw new Error(`Failed to retrieve section keys: ${error.message}`);
    }
  }

  async getContentStatistics() {
    try {
      const statistics = await PageContentRepository.getPageContentStatistics();

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: statistics
      };
    } catch (error) {
      throw new Error(`Failed to retrieve content statistics: ${error.message}`);
    }
  }

  async deleteContentsByPage(pageId, currentUserId) {
    try {
      const deletedCount = await PageContentRepository.deleteByPageId(pageId, currentUserId);

      return {
        success: true,
        message: `Successfully deleted ${deletedCount} page contents`,
        data: { deletedCount }
      };
    } catch (error) {
      throw new Error(`Failed to delete page contents: ${error.message}`);
    }
  }

  async validateContentData(contentData, isUpdate = false) {
    const errors = {};

    // Page ID validation
    if (!isUpdate && !contentData.page_id) {
      errors.page_id = 'Page ID is required';
    } else if (contentData.page_id && !Number.isInteger(parseInt(contentData.page_id))) {
      errors.page_id = 'Page ID must be a valid number';
    }

    // Section key validation
    if (!isUpdate && !contentData.section_key) {
      errors.section_key = 'Section key is required';
    } else if (contentData.section_key) {
      if (typeof contentData.section_key !== 'string' || contentData.section_key.trim().length < 2) {
        errors.section_key = 'Section key must be at least 2 characters long';
      }
      // Check for valid section key format
      const sectionKeyPattern = /^[a-z0-9_]+$/;
      if (!sectionKeyPattern.test(contentData.section_key)) {
        errors.section_key = 'Section key can only contain lowercase letters, numbers, and underscores';
      }
    }

    // Section name validation
    if (!isUpdate && !contentData.section_name) {
      errors.section_name = 'Section name is required';
    } else if (contentData.section_name && (typeof contentData.section_name !== 'string' || contentData.section_name.trim().length < 2)) {
      errors.section_name = 'Section name must be at least 2 characters long';
    }

    // Language validation
    const validLanguages = ['en', 'hi', 'mar'];
    if (!isUpdate && !contentData.language) {
      errors.language = 'Language is required';
    } else if (contentData.language && !validLanguages.includes(contentData.language)) {
      errors.language = 'Language must be one of: en, hi, mar';
    }

    // Content validation
    if (!isUpdate && !contentData.content) {
      errors.content = 'Content is required';
    } else if (contentData.content && (typeof contentData.content !== 'string' || contentData.content.trim().length < 10)) {
      errors.content = 'Content must be at least 10 characters long';
    }

    // Title validation (optional)
    if (contentData.title && (typeof contentData.title !== 'string' || contentData.title.trim().length < 2)) {
      errors.title = 'Title must be at least 2 characters long';
    }

    // Subtitle validation (optional)
    if (contentData.subtitle && (typeof contentData.subtitle !== 'string' || contentData.subtitle.trim().length < 2)) {
      errors.subtitle = 'Subtitle must be at least 2 characters long';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export default new PageContentService();