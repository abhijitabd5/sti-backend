// src/repositories/TransactionCategoryRepository.js

import { TransactionCategory, Transaction } from "../models/index.js";
import { Op } from "sequelize";

class TransactionCategoryRepository {
  async findAll(filters = {}) {
    const {
      search,
      page = 1,
      limit = 10,
      sortBy = "display_order",
      sortOrder = "ASC",
    } = filters;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows: categories, count: total } =
      await TransactionCategory.findAndCountAll({
        where: whereClause,
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: Transaction,
            as: "transactions",
            attributes: ["id"],
            required: false,
          },
        ],
      });

    return {
      data: categories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findById(id) {
    return await TransactionCategory.findByPk(id, {
      include: [
        {
          model: Transaction,
          as: "transactions",
          attributes: ["id", "amount", "transaction_date"],
          required: false,
        },
      ],
    });
  }

  async findBySlug(slug) {
    return await TransactionCategory.findOne({
      where: { slug },
      include: [
        {
          model: Transaction,
          as: "transactions",
          attributes: ["id"],
          required: false,
        },
      ],
    });
  }

  async create(data, currentUserId) {
    return await TransactionCategory.create(data, { currentUserId });
  }

  async update(id, data, currentUserId) {
    const [updatedRows] = await TransactionCategory.update(data, {
      where: { id },
      currentUserId,
      returning: true,
    });

    if (updatedRows === 0) {
      return null;
    }

    return await this.findById(id);
  }

  async delete(id, currentUserId) {
    const category = await this.findById(id);
    if (!category) {
      return null;
    }

    await category.destroy({ currentUserId });
    return category;
  }

  async checkSlugExists(slug, excludeId = null) {
    const whereClause = { slug };
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const existing = await TransactionCategory.findOne({
      where: whereClause,
    });
    return !!existing;
  }

  async checkNameExists(name, excludeId = null) {
    const whereClause = { name };
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const existing = await TransactionCategory.findOne({
      where: whereClause,
    });
    return !!existing;
  }

  async hasLinkedTransactions(categoryId) {
    const transactionCount = await Transaction.count({
      where: { category_id: categoryId },
    });
    return transactionCount > 0;
  }

  async getMaxDisplayOrder() {
    const result = await TransactionCategory.max("display_order");
    return result || 0;
  }

  async updateDisplayOrders(orderData, currentUserId) {
    const promises = orderData.map(({ id, display_order }) =>
      TransactionCategory.update(
        { display_order },
        { where: { id }, currentUserId }
      )
    );

    await Promise.all(promises);
    return true;
  }

  async getStats() {
    const totalCategories = await TransactionCategory.count();
    const categoriesWithTransactions = await TransactionCategory.count({
      include: [
        {
          model: Transaction,
          as: "transactions",
          required: true,
        },
      ],
    });

    return {
      totalCategories,
      categoriesWithTransactions,
      emptyCategories: totalCategories - categoriesWithTransactions,
    };
  }
}

export default new TransactionCategoryRepository();