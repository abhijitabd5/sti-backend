// src/services/GalleryService.js
import GalleryRepository from '../repositories/GalleryRepository.js';
import { generateSlug } from '../utils/customSlugify.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages.js';
import path from 'path';
import fs from 'fs/promises';

class GalleryService {
  constructor() {
    this.storageUrl = process.env.STORAGE_URL || '';
  }

  async createGalleryItem(data, files, currentUserId) {
    try {
      // Generate unique slug
      if (data.title) {
        data.slug = await this.generateUniqueSlug(data.title.trim());
      } else if (!data.slug) {
        throw new Error('Title is required to generate slug');
      }

      if (!data.media_type || !['photo', 'video'].includes(data.media_type.trim())) {
        console.log("Inside if condition and Media type is ",data.media_type);
        throw new Error('Media type must be either "photo" or "video"');
      }

      // Handle main media file upload or remote URL
      console.log(files.file, "Remote check ",data.is_media_remote.trim()=="false");
      if (files.file && data.is_media_remote.trim()=="false") {
        const fileInfo = await this.processFileUpload(files.file[0], data.media_type);
        data.media_path = fileInfo.path;
      } else if (data.is_media_remote && !data.media_path) {
        throw new Error('Remote media URL is required when is_media_remote is true');
      } else if (!files.file && !data.is_media_remote) {
        throw new Error('Either upload a file or provide a remote media URL');
      }

      // Handle thumbnail for videos
      if (data.media_type === 'video') {
        if (files.thumbnail && !data.is_thumbnail_remote) {
          const thumbnailInfo = await this.processFileUpload(files.thumbnail[0], 'photo');
          data.thumbnail_path = thumbnailInfo.path;
        } else if (data.is_thumbnail_remote.trim()=="true" && !data.thumbnail_path) {
          throw new Error('Remote thumbnail URL is required when is_thumbnail_remote is true for videos');
        } else if (!files.thumbnail && data.is_thumbnail_remote.trim()=="false") {
          throw new Error('Thumbnail is required for videos - either upload a file or provide a remote thumbnail URL');
        }
      }

      // Set defaults
      data.display_order = data.display_order || 0;
      data.is_media_remote = data.is_media_remote || false;
      data.is_thumbnail_remote = data.is_thumbnail_remote || false;

      const galleryItem = await GalleryRepository.create(data, { currentUserId });
      
      // Format response with storage URL
      const formattedItem = this.formatGalleryItem(galleryItem);

      return {
        success: true,
        message: SUCCESS_MESSAGES.GALLERY_ITEM_CREATED,
        data: formattedItem
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.GALLERY_ITEM_CREATE_FAILED);
    }
  }

  async updateGalleryItem(id, data, files, currentUserId) {
    try {
      const existingItem = await GalleryRepository.findById(id);
      if (!existingItem) {
        throw new Error(ERROR_MESSAGES.GALLERY_ITEM_NOT_FOUND);
      }

      // Generate unique slug if title is changed
      if (data.title && data.title !== existingItem.title) {
        data.slug = await this.generateUniqueSlug(data.title, id);
      }

      // Handle new main media file upload
      if (files.file) {
        // Delete old file if it exists and is not remote
        await this.deleteOldFile(existingItem, 'media');
        
        const fileInfo = await this.processFileUpload(files.file[0], existingItem.media_type);
        data.media_path = fileInfo.path;
        data.is_media_remote = false;
      }

      // Handle new thumbnail file upload for videos
      if (existingItem.media_type === 'video' && files.thumbnail) {
        // Delete old thumbnail if it exists and is not remote
        await this.deleteOldFile(existingItem, 'thumbnail');
        
        const thumbnailInfo = await this.processFileUpload(files.thumbnail[0], 'photo');
        data.thumbnail_path = thumbnailInfo.path;
        data.is_thumbnail_remote = false;
      }

      // Validate remote URLs if specified
      if (data.is_media_remote && !data.media_path) {
        throw new Error('Remote media URL is required when is_media_remote is true');
      }

      if (existingItem.media_type === 'video' && data.is_thumbnail_remote && !data.thumbnail_path) {
        throw new Error('Remote thumbnail URL is required when is_thumbnail_remote is true for videos');
      }

      const updatedItem = await GalleryRepository.update(id, data, { currentUserId });
      if (!updatedItem) {
        throw new Error(ERROR_MESSAGES.GALLERY_ITEM_UPDATE_FAILED);
      }

      const formattedItem = this.formatGalleryItem(updatedItem);

      return {
        success: true,
        message: SUCCESS_MESSAGES.GALLERY_ITEM_UPDATED,
        data: formattedItem
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.GALLERY_ITEM_UPDATE_FAILED);
    }
  }

  async deleteGalleryItem(id, currentUserId) {
    try {
      const existingItem = await GalleryRepository.findById(id);
      if (!existingItem) {
        throw new Error(ERROR_MESSAGES.GALLERY_ITEM_NOT_FOUND);
      }

      const deleted = await GalleryRepository.softDelete(id, { currentUserId });
      if (!deleted) {
        throw new Error(ERROR_MESSAGES.GALLERY_ITEM_DELETE_FAILED);
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.GALLERY_ITEM_DELETED
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.GALLERY_ITEM_DELETE_FAILED);
    }
  }

  async updateGalleryItemStatus(id, isActive, currentUserId) {
    try {
      const updatedItem = await GalleryRepository.updateStatus(id, isActive, { currentUserId });
      if (!updatedItem) {
        throw new Error(ERROR_MESSAGES.GALLERY_ITEM_NOT_FOUND);
      }

      const formattedItem = this.formatGalleryItem(updatedItem);

      return {
        success: true,
        message: SUCCESS_MESSAGES.GALLERY_ITEM_STATUS_UPDATED,
        data: formattedItem
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.GALLERY_ITEM_UPDATE_FAILED);
    }
  }

  async getAllGalleryItems(filters, currentUserId) {
    try {
      const { page = 1, limit = 20 } = filters;
      const offset = (page - 1) * limit;

      const result = await GalleryRepository.findAll(filters, { limit, offset });
      
      const formattedItems = result.rows.map(item => this.formatGalleryItem(item));

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.count,
        totalPages: Math.ceil(result.count / limit),
        hasNext: page < Math.ceil(result.count / limit),
        hasPrev: page > 1
      };

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: formattedItems,
        pagination
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.GALLERY_ITEMS_FETCH_FAILED);
    }
  }

  async getGalleryItemById(id, currentUserId) {
    try {
      const item = await GalleryRepository.findById(id);
      if (!item) {
        throw new Error(ERROR_MESSAGES.GALLERY_ITEM_NOT_FOUND);
      }

      const formattedItem = this.formatGalleryItem(item);

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: formattedItem
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.GALLERY_ITEM_NOT_FOUND);
    }
  }

  async bulkUploadGalleryItems(files, data, currentUserId) {
    try {
      const results = [];
      const errors = [];

      for (let i = 0; i < files.length; i++) {
        try {
          const file = files[i];
          const itemData = {
            media_type: 'photo', // Assuming bulk upload is for photos only
            caption: data.caption || '',
            title: data.title ? `${data.title} ${i + 1}` : `Gallery Item ${i + 1}`,
            page_slug: data.page_slug || 'image_gallery',
            display_order: (data.display_order || 0) + i,
            is_media_remote: false,
            is_thumbnail_remote: false
          };

          const result = await this.createGalleryItem(itemData, { file: [file] }, currentUserId);
          results.push(result.data);
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      return {
        success: true,
        message: `${results.length} items uploaded successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
        data: {
          successful: results,
          failed: errors,
          total_processed: files.length,
          successful_count: results.length,
          failed_count: errors.length
        }
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.BULK_UPLOAD_FAILED);
    }
  }

  async reorderGalleryItems(items, currentUserId) {
    try {
      await GalleryRepository.bulkUpdateDisplayOrder(items, { currentUserId });

      return {
        success: true,
        message: SUCCESS_MESSAGES.GALLERY_ITEMS_REORDERED
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.GALLERY_ITEMS_REORDER_FAILED);
    }
  }

  async getGalleryStats(currentUserId) {
    try {
      const stats = await GalleryRepository.getStats();

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: stats
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.STATS_FETCH_FAILED);
    }
  }

  // Public website methods
  async getGalleryItemBySlug(slug) {
    try {
      const item = await GalleryRepository.findBySlug(slug);
      if (!item || !item.is_active) {
        throw new Error(ERROR_MESSAGES.GALLERY_ITEM_NOT_FOUND);
      }

      const formattedItem = this.formatGalleryItem(item);

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: formattedItem
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.GALLERY_ITEM_NOT_FOUND);
    }
  }

  async getGalleryItemsByPage(pageSlug) {
    try {
      const items = await GalleryRepository.findActiveByPageSlug(pageSlug);
      const formattedItems = items.map(item => this.formatGalleryItem(item));

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: formattedItems
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.GALLERY_ITEMS_FETCH_FAILED);
    }
  }


async generateUniqueSlug(title, excludeId = null) {
  // Sanitize the title
  let sanitizedTitle = title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);

  let slug = `${sanitizedTitle}-${timestamp}`;
  return slug;
}


  async processFileUpload(file, mediaType) {
    const uploadDir = mediaType === 'photo' ? 'uploads/gallery/images' : 'uploads/gallery/videos';
    
    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}-${random}${extension}`;
    const relativePath = `gallery/${mediaType === 'photo' ? 'images' : 'videos'}/${filename}`;

    return {
      path: relativePath,
      fullPath: path.join(uploadDir, filename)
    };
  }

  async deleteOldFile(item, fileType = 'media') {
    try {
      let oldFilePath = null;
      
      if (fileType === 'media' && item.media_path && !item.is_media_remote) {
        oldFilePath = path.join('uploads', item.media_path);
      } else if (fileType === 'thumbnail' && item.thumbnail_path && !item.is_thumbnail_remote) {
        oldFilePath = path.join('uploads', item.thumbnail_path);
      }

      if (oldFilePath) {
        await fs.unlink(oldFilePath).catch(() => {
          // File might not exist, ignore error
        });
      }
    } catch (error) {
      // Log error but don't throw - file deletion failure shouldn't stop the update
      console.error('Error deleting old file:', error.message);
    }
  }

  formatGalleryItem(item) {
    const formatted = item.toJSON ? item.toJSON() : item;

    // Add full URL for main media based on remote status
    if (formatted.media_path) {
      if (formatted.is_media_remote) {
        // Remote media - use URL as-is
        formatted.media_url = formatted.media_path;
      } else {
        // Local media - prepend storage URL
        formatted.media_url = `${this.storageUrl}/${formatted.media_path}`;
      }
    }

    // Add full URL for thumbnail if it's a video
    if (formatted.media_type === 'video' && formatted.thumbnail_path) {
      if (formatted.is_thumbnail_remote) {
        // Remote thumbnail - use URL as-is
        formatted.thumbnail_url = formatted.thumbnail_path;
      } else {
        // Local thumbnail - prepend storage URL
        formatted.thumbnail_url = `${this.storageUrl}/${formatted.thumbnail_path}`;
      }
    }

    return formatted;
  }
}

export default new GalleryService();