// src/controllers/website/WebGalleryController.js
import GalleryService from '../../services/GalleryService.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse 
} from '../../utils/responseFormatter.js';

class WebsiteGalleryController {
  static async getGalleryItemBySlug(req, res) {
    try {
      const { slug } = req.params;

      if (!slug) {
        return errorResponse(res, 'Gallery item slug is required', 400);
      }

      const result = await GalleryService.getGalleryItemBySlug(slug);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes('not found')) {
        return notFoundResponse(res, 'Gallery item not found or inactive');
      }
      return errorResponse(res, error.message, 400);
    }
  }

  static async getGalleryItemsByPage(req, res) {
    try {
      const { page_slug } = req.params;

      if (!page_slug) {
        return errorResponse(res, 'Page slug is required', 400);
      }

      const result = await GalleryService.getGalleryItemsByPage(page_slug);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}

export default WebsiteGalleryController;