// src/repositories/PageContentRepository.js
import { PageContent, Page } from '../models/index.js';
import { Op } from 'sequelize';

class PageContentRepository {
  async findAll(filters = {}) {
    const {
      pageId,
      language,
      sectionKey,
      search,
      limit = 10,
      offset = 0,
      orderBy = 'createdAt',
      orderDirection = 'DESC'
    } = filters;

    const whereConditions = {};
    
    if (pageId) {
      whereConditions.page_id = pageId;
    }

    if (language) {
      whereConditions.language = language;
    }

    if (sectionKey) {
      whereConditions.section_key = sectionKey;
    }

    if (search) {
      whereConditions[Op.or] = [
        { section_name: { [Op.like]: `%${search}%` } },
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }

    const result = await PageContent.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Page,
          as: 'page',
          attributes: ['id', 'name', 'slug']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[orderBy, orderDirection.toUpperCase()]],
      distinct: true
    });

    return {
      contents: result.rows,
      total: result.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };
  }

  async findById(id, includePage = true) {
    const includeOptions = includePage ? [
      {
        model: Page,
        as: 'page',
        attributes: ['id', 'name', 'slug']
      }
    ] : [];

    return await PageContent.findByPk(id, {
      include: includeOptions
    });
  }

  async findByPageAndSection(pageId, sectionKey, language = null) {
    const whereConditions = {
      page_id: pageId,
      section_key: sectionKey
    };

    if (language) {
      whereConditions.language = language;
    }

    return await PageContent.findAll({
      where: whereConditions,
      include: [
        {
          model: Page,
          as: 'page',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [['language', 'ASC']]
    });
  }

  async findByPageSlug(pageSlug, language = null, sectionKey = null) {
    const whereConditions = {};
    
    if (language) {
      whereConditions.language = language;
    }

    if (sectionKey) {
      whereConditions.section_key = sectionKey;
    }

    return await PageContent.findAll({
      where: whereConditions,
      include: [
        {
          model: Page,
          as: 'page',
          where: { slug: pageSlug },
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [['section_key', 'ASC']]
    });
  }

  async create(contentData, currentUserId) {
    return await PageContent.create(contentData, { currentUserId });
  }

  async update(id, updateData, currentUserId) {
    const [affectedRows] = await PageContent.update(updateData, {
      where: { id },
      currentUserId
    });

    if (affectedRows === 0) {
      return null;
    }

    return await this.findById(id);
  }

  async delete(id, currentUserId) {
    const content = await this.findById(id, false);
    if (!content) {
      return null;
    }

    await content.destroy({ currentUserId });
    return content;
  }

  async bulkCreate(contentsData, currentUserId) {
    return await PageContent.bulkCreate(contentsData, { currentUserId });
  }

  async deleteByPageId(pageId, currentUserId) {
    const contents = await PageContent.findAll({
      where: { page_id: pageId }
    });

    for (const content of contents) {
      await content.destroy({ currentUserId });
    }

    return contents.length;
  }

  async getContentsByPage(pageId, language = null) {
    const whereConditions = { page_id: pageId };
    
    if (language) {
      whereConditions.language = language;
    }

    return await PageContent.findAll({
      where: whereConditions,
      order: [['section_key', 'ASC'], ['language', 'ASC']]
    });
  }

  async getSectionKeys(pageId) {
    const sections = await PageContent.findAll({
      where: { page_id: pageId },
      attributes: ['section_key', 'section_name'],
      group: ['section_key', 'section_name'],
      order: [['section_key', 'ASC']]
    });

    return sections.map(section => ({
      key: section.section_key,
      name: section.section_name
    }));
  }

  async getPageContentStatistics() {
    const totalContents = await PageContent.count();
    const contentsByLanguage = await PageContent.findAll({
      attributes: [
        'language',
        [PageContent.sequelize.fn('COUNT', PageContent.sequelize.col('id')), 'count']
      ],
      group: ['language'],
      raw: true
    });

    const contentsByPage = await PageContent.findAll({
      attributes: [
        'page_name',
        [PageContent.sequelize.fn('COUNT', PageContent.sequelize.col('id')), 'count']
      ],
      group: ['page_name'],
      order: [[PageContent.sequelize.fn('COUNT', PageContent.sequelize.col('id')), 'DESC']],
      limit: 10,
      raw: true
    });

    return {
      totalContents,
      contentsByLanguage,
      topContentPages: contentsByPage
    };
  }

  async checkDuplicateContent(pageId, sectionKey, language, excludeId = null) {
    const whereConditions = {
      page_id: pageId,
      section_key: sectionKey,
      language: language
    };
    
    if (excludeId) {
      whereConditions.id = { [Op.ne]: excludeId };
    }

    const existingContent = await PageContent.findOne({
      where: whereConditions,
      attributes: ['id']
    });

    return !!existingContent;
  }
}

export default new PageContentRepository();