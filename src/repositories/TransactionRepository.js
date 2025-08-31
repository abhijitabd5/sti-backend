// src/repositories/TransactionRepository.js

import { Transaction, TransactionCategory, User } from '../models/index.js';
import { Op, fn, col, literal } from 'sequelize';

class TransactionRepository {
  async findAll(filters = {}) {
    const {
      search,
      categoryId,
      createdBy,
      paymentMode,
      type,
      dateFrom,
      dateTo,
      amountMin,
      amountMax,
      page = 1,
      limit = 10,
      sortBy = 'transaction_date',
      sortOrder = 'DESC'
    } = filters;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { description: { [Op.like]: `%${search}%` } },
        { payee_name: { [Op.like]: `%${search}%` } },
        { reference_note: { [Op.like]: `%${search}%` } },
        { receipt_number: { [Op.like]: `%${search}%` } },
        { transaction_id: { [Op.like]: `%${search}%` } }
      ];
    }

    // Filter by category
    if (categoryId) {
      whereClause.category_id = categoryId;
    }

    // Filter by creator
    if (createdBy) {
      whereClause.created_by = createdBy;
    }

    // Filter by payment mode
    if (paymentMode) {
      whereClause.payment_mode = paymentMode;
    }

    // Filter by type
    if (type) {
      whereClause.type = type; // income | expense
    }

    // Date range filter
    if (dateFrom || dateTo) {
      whereClause.transaction_date = {};
      if (dateFrom) {
        whereClause.transaction_date[Op.gte] = dateFrom;
      }
      if (dateTo) {
        whereClause.transaction_date[Op.lte] = dateTo;
      }
    }

    // Amount range filter
    if (amountMin || amountMax) {
      whereClause.amount = {};
      if (amountMin) {
        whereClause.amount[Op.gte] = amountMin;
      }
      if (amountMax) {
        whereClause.amount[Op.lte] = amountMax;
      }
    }

    const { rows: transactions, count: total } = await Transaction.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: TransactionCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'role']
        }
      ]
    });

    return {
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  async findById(id) {
    return await Transaction.findByPk(id, {
      include: [
        {
          model: TransactionCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'role', 'mobile']
        }
      ]
    });
  }

  async create(data, currentUserId) {
    return await Transaction.create(data, { currentUserId });
  }

  async update(id, data, currentUserId) {
    const [updatedRows] = await Transaction.update(data, {
      where: { id },
      currentUserId,
      returning: true
    });

    if (updatedRows === 0) {
      return null;
    }

    return await this.findById(id);
  }

  async delete(id, currentUserId) {
    const trx = await this.findById(id);
    if (!trx) {
      return null;
    }

    await trx.destroy({ currentUserId });
    return trx;
  }

  async getTransactionsByCategory(categoryId, filters = {}) {
    const { dateFrom, dateTo, limit = 10 } = filters;
    const whereClause = { category_id: categoryId };

    if (dateFrom || dateTo) {
      whereClause.transaction_date = {};
      if (dateFrom) whereClause.transaction_date[Op.gte] = dateFrom;
      if (dateTo) whereClause.transaction_date[Op.lte] = dateTo;
    }

    return await Transaction.findAll({
      where: whereClause,
      order: [['transaction_date', 'DESC']],
      limit: parseInt(limit),
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name']
        }
      ]
    });
  }

  async getDashboardStats(filters = {}) {
    const { dateFrom, dateTo } = filters;
    const whereClause = {};

    if (dateFrom || dateTo) {
      whereClause.transaction_date = {};
      if (dateFrom) whereClause.transaction_date[Op.gte] = dateFrom;
      if (dateTo) whereClause.transaction_date[Op.lte] = dateTo;
    }

    // Totals
    const totalIncome = await Transaction.sum('amount', {
      where: { ...whereClause, type: 'income' }
    });

    const totalExpenses = await Transaction.sum('amount', {
      where: { ...whereClause, type: 'expense' }
    });

    const transactionCount = await Transaction.count({ where: whereClause });

    // By category
    const transactionsByCategory = await Transaction.findAll({
      attributes: [
        [col('category.name'), 'categoryName'],
        [fn('SUM', col('amount')), 'totalAmount'],
        [fn('COUNT', col('id')), 'transactionCount']
      ],
      where: whereClause,
      include: [{ model: TransactionCategory, as: 'category', attributes: [] }],
      group: ['category_id'],
      order: [[fn('SUM', col('amount')), 'DESC']]
    });

    // By payment mode
    const transactionsByPaymentMode = await Transaction.findAll({
      attributes: [
        'payment_mode',
        [fn('SUM', col('amount')), 'totalAmount'],
        [fn('COUNT', col('id')), 'transactionCount']
      ],
      where: whereClause,
      group: ['payment_mode'],
      order: [[fn('SUM', col('amount')), 'DESC']]
    });

    // Monthly (last 12 months)
    const monthlyTransactions = await Transaction.findAll({
      attributes: [
        [fn('YEAR', col('transaction_date')), 'year'],
        [fn('MONTH', col('transaction_date')), 'month'],
        [fn('SUM', col('amount')), 'totalAmount'],
        [fn('COUNT', col('id')), 'transactionCount']
      ],
      where: {
        ...whereClause,
        transaction_date: {
          [Op.gte]: literal('DATE_SUB(NOW(), INTERVAL 12 MONTH)')
        }
      },
      group: [fn('YEAR', col('transaction_date')), fn('MONTH', col('transaction_date'))],
      order: [[fn('YEAR', col('transaction_date')), 'DESC'], [fn('MONTH', col('transaction_date')), 'DESC']]
    });

    return {
      totalIncome: totalIncome || 0,
      totalExpenses: totalExpenses || 0,
      netBalance: (totalIncome || 0) - (totalExpenses || 0),
      transactionCount: transactionCount || 0,
      transactionsByCategory,
      transactionsByPaymentMode,
      monthlyTransactions
    };
  }

  async getReceiptNumberExists(receiptNumber, excludeId = null) {
    const whereClause = { receipt_number: receiptNumber };
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const existing = await Transaction.findOne({ where: whereClause });
    return !!existing;
  }

  async getTransactionsByUser(userId, filters = {}) {
    const { dateFrom, dateTo, limit = 10 } = filters;
    const whereClause = { created_by: userId };

    if (dateFrom || dateTo) {
      whereClause.transaction_date = {};
      if (dateFrom) whereClause.transaction_date[Op.gte] = dateFrom;
      if (dateTo) whereClause.transaction_date[Op.lte] = dateTo;
    }

    return await Transaction.findAll({
      where: whereClause,
      order: [['transaction_date', 'DESC']],
      limit: parseInt(limit),
      include: [{
        model: TransactionCategory,
        as: 'category',
        attributes: ['id', 'name']
      }]
    });
  }

  async getTotalTransactionByCategory(categoryId, filters = {}) {
    const { dateFrom, dateTo } = filters;
    const whereClause = { category_id: categoryId };

    if (dateFrom || dateTo) {
      whereClause.transaction_date = {};
      if (dateFrom) whereClause.transaction_date[Op.gte] = dateFrom;
      if (dateTo) whereClause.transaction_date[Op.lte] = dateTo;
    }

    const result = await Transaction.sum('amount', { where: whereClause });
    return result || 0;
  }
}

export default new TransactionRepository();