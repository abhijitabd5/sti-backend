// src/controllers/internal/GalleryController.js
import GalleryService from '../src/services/GalleryService.js';
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse, 
  createResponse, 
  notFoundResponse 
} from '../src/utils/responseFormatter.js';

class GalleryController {
  static async createGalleryItem(req, res) {
    try {
      const files = req.files; // Changed from req.file to req.files
      const data = req.body;
      const currentUserId = req.user.id;

      const result = await GalleryService.createGalleryItem(data, files, currentUserId);
      return createResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async updateGalleryItem(req, res) {
    try {
      const { id } = req.params;
      const files = req.files; // Changed from req.file to req.files
      const data = req.body;
      const currentUserId = req.user.id;

      const result = await GalleryService.updateGalleryItem(id, data, files, currentUserId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes('not found')) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  static async deleteGalleryItem(req, res) {
    try {
      const { id } = req.params;
      const currentUserId = req.user.id;

      const result = await GalleryService.deleteGalleryItem(id, currentUserId);
      return successResponse(res, null, result.message);
    } catch (error) {
      if (error.message.includes('not found')) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  static async updateGalleryItemStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      const currentUserId = req.user.id;

      // Validate is_active field
      if (typeof is_active !== 'boolean') {
        return errorResponse(res, 'is_active field is required and must be a boolean', 400);
      }

      const result = await GalleryService.updateGalleryItemStatus(id, is_active, currentUserId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes('not found')) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  static async getAllGalleryItems(req, res) {
    try {
      const filters = {
        page_slug: req.query.page_slug,
        media_type: req.query.media_type,
        status: req.query.status,
        search: req.query.search,
        page: req.query.page || 1,
        limit: req.query.limit || 20
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined || filters[key] === '') {
          delete filters[key];
        }
      });

      const currentUserId = req.user.id;
      const result = await GalleryService.getAllGalleryItems(filters, currentUserId);
      
      return paginatedResponse(res, result.data, result.pagination, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getGalleryItemById(req, res) {
    try {
      const { id } = req.params;
      const currentUserId = req.user.id;

      const result = await GalleryService.getGalleryItemById(id, currentUserId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes('not found')) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  static async bulkUploadGalleryItems(req, res) {
    try {
      const files = req.files;
      const data = req.body;
      const currentUserId = req.user.id;

      if (!files || files.length === 0) {
        return errorResponse(res, 'No files uploaded', 400);
      }

      const result = await GalleryService.bulkUploadGalleryItems(files, data, currentUserId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async reorderGalleryItems(req, res) {
    try {
      const { items } = req.body;
      const currentUserId = req.user.id;

      // Validate items array
      if (!Array.isArray(items) || items.length === 0) {
        return errorResponse(res, 'Items array is required and must not be empty', 400);
      }

      // Validate each item structure
      for (const item of items) {
        if (!item.id || typeof item.display_order !== 'number') {
          return errorResponse(res, 'Each item must have id and display_order fields', 400);
        }
      }

      const result = await GalleryService.reorderGalleryItems(items, currentUserId);
      return successResponse(res, null, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getGalleryStats(req, res) {
    try {
      const currentUserId = req.user.id;
      const result = await GalleryService.getGalleryStats(currentUserId);
      
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}

export default GalleryController;