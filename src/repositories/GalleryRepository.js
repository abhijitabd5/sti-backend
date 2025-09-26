// src/repositories/GalleryRepository.js
import { GalleryItem } from '../models/index.js';
import { Op } from 'sequelize';

class GalleryRepository {
  async create(data, options = {}) {
    return await GalleryItem.create(data, options);
  }

  async findById(id, options = {}) {
    const whereClause = { id };
    if (!options.includeDeleted) {
      whereClause.is_deleted = false;
    }

    return await GalleryItem.findOne({
      where: whereClause,
      ...options
    });
  }

  async findBySlug(slug, options = {}) {
    const whereClause = { slug };
    if (!options.includeDeleted) {
      whereClause.is_deleted = false;
    }

    return await GalleryItem.findOne({
      where: whereClause,
      ...options
    });
  }

  async findAll(filters = {}, options = {}) {
    const whereClause = {};
    
    // Don't include deleted items unless specifically requested
    if (!options.includeDeleted) {
      whereClause.is_deleted = false;
    }

    // Apply filters
    if (filters.page_slug) {
      whereClause.page_slug = filters.page_slug;
    }

    if (filters.media_type) {
      whereClause.media_type = filters.media_type;
    }

    if (filters.status) {
      whereClause.is_active = filters.status === 'active';
    }

    if (filters.search) {
      whereClause[Op.or] = [
        { caption: { [Op.like]: `%${filters.search}%` } },
        { title: { [Op.like]: `%${filters.search}%` } }
      ];
    }

    const queryOptions = {
      where: whereClause,
      order: [
        ['display_order', 'ASC'],
        ['createdAt', 'DESC']
      ]
    };

    // Add pagination if provided
    if (options.limit) {
      queryOptions.limit = parseInt(options.limit);
    }
    if (options.offset) {
      queryOptions.offset = parseInt(options.offset);
    }

    return await GalleryItem.findAndCountAll(queryOptions);
  }

  async findActiveByPageSlug(pageSlug, options = {}) {
    return await GalleryItem.findAll({
      where: {
        page_slug: pageSlug,
        is_active: true,
        is_deleted: false
      },
      order: [
        ['display_order', 'ASC'],
        ['createdAt', 'DESC']
      ],
      ...options
    });
  }

  async update(id, data, options = {}) {
    const [affectedCount] = await GalleryItem.update(data, {
      where: { id, is_deleted: false },
      ...options
    });

    if (affectedCount === 0) {
      return null;
    }

    return await this.findById(id);
  }

  async updateStatus(id, isActive, options = {}) {
    return await this.update(id, { is_active: isActive }, options);
  }

  async softDelete(id, options = {}) {
    const [affectedCount] = await GalleryItem.update(
      { 
        is_deleted: true,
        deleted_by: options.currentUserId 
      },
      {
        where: { id, is_deleted: false },
        ...options
      }
    );

    return affectedCount > 0;
  }

  async bulkUpdateDisplayOrder(items, options = {}) {
    const updates = items.map(item => 
      GalleryItem.update(
        { display_order: item.display_order },
        { 
          where: { id: item.id, is_deleted: false },
          ...options
        }
      )
    );

    return await Promise.all(updates);
  }

  async getStats() {
    const totalItems = await GalleryItem.count({
      where: { is_deleted: false }
    });

    const activeItems = await GalleryItem.count({
      where: { is_deleted: false, is_active: true }
    });

    const inactiveItems = await GalleryItem.count({
      where: { is_deleted: false, is_active: false }
    });

    const photoCount = await GalleryItem.count({
      where: { is_deleted: false, media_type: 'photo' }
    });

    const videoCount = await GalleryItem.count({
      where: { is_deleted: false, media_type: 'video' }
    });

    const byPage = await GalleryItem.findAll({
      attributes: [
        'page_slug',
        [GalleryItem.sequelize.fn('COUNT', GalleryItem.sequelize.col('id')), 'count']
      ],
      where: { is_deleted: false },
      group: ['page_slug'],
      raw: true
    });

    return {
      total: totalItems,
      active: activeItems,
      inactive: inactiveItems,
      photos: photoCount,
      videos: videoCount,
      by_page: byPage
    };
  }

  async checkSlugExists(slug, excludeId = null) {
    const whereClause = { slug, is_deleted: false };
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const existing = await GalleryItem.findOne({ where: whereClause });
    return !!existing;
  }
}

export default new GalleryRepository();