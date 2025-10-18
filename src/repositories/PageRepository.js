// src/repositories/PageRepository.js
import { Page, PageContent } from '../models/index.js';
import { Op } from 'sequelize';

class PageRepository {
  async findAll(filters = {}) {
    const {
      language,
      search,
      limit = 10,
      offset = 0,
      orderBy = 'createdAt',
      orderDirection = 'DESC'
    } = filters;

    const whereConditions = {};
    
    if (language) {
      whereConditions.language = language;
    }

    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
        { page_title: { [Op.like]: `%${search}%` } }
      ];
    }

    const result = await Page.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: PageContent,
          as: 'contents',
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[orderBy, orderDirection.toUpperCase()]],
      distinct: true
    });

    return {
      pages: result.rows,
      total: result.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };
  }

  async findById(id, includeContents = true) {
    const includeOptions = includeContents ? [
      {
        model: PageContent,
        as: 'contents',
        required: false
      }
    ] : [];

    return await Page.findByPk(id, {
      include: includeOptions
    });
  }

  async findBySlug(slug, language = null, includeContents = true) {
    const whereConditions = { slug };
    
    if (language) {
      whereConditions.language = language;
    }

    const includeOptions = includeContents ? [
      {
        model: PageContent,
        as: 'contents',
        where: language ? { language } : {},
        required: false
      }
    ] : [];

    return await Page.findOne({
      where: whereConditions,
      include: includeOptions
    });
  }

  async create(pageData, currentUserId) {
    return await Page.create(pageData, { currentUserId });
  }

  async update(id, updateData, currentUserId) {
    const [affectedRows] = await Page.update(updateData, {
      where: { id },
      currentUserId
    });

    if (affectedRows === 0) {
      return null;
    }

    return await this.findById(id);
  }

  async delete(id, currentUserId) {
    const page = await this.findById(id, false);
    if (!page) {
      return null;
    }

    await page.destroy({ currentUserId });
    return page;
  }

  async checkSlugExists(slug, language, excludeId = null) {
    const whereConditions = { slug, language };
    
    if (excludeId) {
      whereConditions.id = { [Op.ne]: excludeId };
    }

    const existingPage = await Page.findOne({
      where: whereConditions,
      attributes: ['id']
    });

    return !!existingPage;
  }

  async getPagesByLanguage(language) {
    return await Page.findAll({
      where: { language },
      attributes: ['id', 'name', 'slug', 'page_title'],
      order: [['name', 'ASC']]
    });
  }

  async getPageStatistics() {
    const totalPages = await Page.count();
    const pagesByLanguage = await Page.findAll({
      attributes: [
        'language',
        [Page.sequelize.fn('COUNT', Page.sequelize.col('id')), 'count']
      ],
      group: ['language'],
      raw: true
    });

    return {
      totalPages,
      pagesByLanguage
    };
  }
}

export default new PageRepository();