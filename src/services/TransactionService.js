// src/services/TransactionService.js
import TransactionRepository from '../repositories/TransactionRepository.js';
import TransactionCategoryRepository from '../repositories/TransactionCategoryRepository.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants/messages.js';

class TransactionService {
  async getAllTransactions(filters, currentUserId) {
    try {
      const result = await TransactionRepository.findAll(filters);
      
      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: result.data,
        pagination: result.pagination
      };
    } catch (error) {
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
  }

  async getTransactionById(id) {
    try {
      const transaction = await TransactionRepository.findById(id);
      
      if (!transaction) {
        return {
          success: false,
          message: ERROR_MESSAGES.NOT_FOUND,
          data: null
        };
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: transaction
      };
    } catch (error) {
      throw new Error(`Failed to fetch transaction: ${error.message}`);
    }
  }

  async createTransaction(data, currentUserId) {
    try {
      const { category_id, receipt_number, type } = data;

      // Validate type
      if (!type || !["income", "expense"].includes(type)) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_TYPE,
          data: null
        };
      }

      // Validate category exists
      const category = await TransactionCategoryRepository.findById(category_id);
      if (!category) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_CATEGORY,
          data: null
        };
      }

      // Check if receipt number is unique (if provided)
      if (receipt_number) {
        const receiptExists = await TransactionRepository.getReceiptNumberExists(receipt_number);
        if (receiptExists) {
          return {
            success: false,
            message: ERROR_MESSAGES.DUPLICATE_RECEIPT,
            data: null
          };
        }
      }

      // Generate receipt number if not provided
      let finalReceiptNumber = receipt_number;
      if (!finalReceiptNumber) {
        finalReceiptNumber = await this.generateReceiptNumber();
      }

      const transactionData = {
        ...data,
        receipt_number: finalReceiptNumber,
        created_by: currentUserId
      };

      const transaction = await TransactionRepository.create(transactionData, currentUserId);

      // Fetch created transaction with associations
      const createdTransaction = await TransactionRepository.findById(transaction.id);

      return {
        success: true,
        message: SUCCESS_MESSAGES.CREATED,
        data: createdTransaction
      };
    } catch (error) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
  }

  async updateTransaction(id, data, currentUserId) {
    try {
      const existingTransaction = await TransactionRepository.findById(id);
      if (!existingTransaction) {
        return {
          success: false,
          message: ERROR_MESSAGES.NOT_FOUND,
          data: null
        };
      }

      // Validate type if being updated
      if (data.type && !["income", "expense"].includes(data.type)) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_TYPE,
          data: null
        };
      }

      // Validate category if being updated
      if (data.category_id) {
        const category = await TransactionCategoryRepository.findById(data.category_id);
        if (!category) {
          return {
            success: false,
            message: ERROR_MESSAGES.INVALID_CATEGORY,
            data: null
          };
        }
      }

      // Check receipt number uniqueness if being updated
      if (data.receipt_number) {
        const receiptExists = await TransactionRepository.getReceiptNumberExists(data.receipt_number, id);
        if (receiptExists) {
          return {
            success: false,
            message: ERROR_MESSAGES.DUPLICATE_RECEIPT,
            data: null
          };
        }
      }

      const updatedTransaction = await TransactionRepository.update(id, data, currentUserId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.UPDATED,
        data: updatedTransaction
      };
    } catch (error) {
      throw new Error(`Failed to update transaction: ${error.message}`);
    }
  }

  async deleteTransaction(id, currentUserId) {
    try {
      const transaction = await TransactionRepository.findById(id);
      if (!transaction) {
        return {
          success: false,
          message: ERROR_MESSAGES.NOT_FOUND,
          data: null
        };
      }

      await TransactionRepository.delete(id, currentUserId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.DELETED,
        data: transaction
      };
    } catch (error) {
      throw new Error(`Failed to delete transaction: ${error.message}`);
    }
  }

  async getTransactionsByCategory(categoryId, filters = {}) {
    try {
      const category = await TransactionCategoryRepository.findById(categoryId);
      if (!category) {
        return {
          success: false,
          message: ERROR_MESSAGES.CATEGORY_NOT_FOUND,
          data: null
        };
      }

      const transactions = await TransactionRepository.getTransactionsByCategory(categoryId, filters);

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: {
          category: {
            id: category.id,
            name: category.name,
            slug: category.slug
          },
          transactions
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch transactions by category: ${error.message}`);
    }
  }

  async getTransactionsByUser(userId, filters = {}) {
    try {
      const transactions = await TransactionRepository.getTransactionsByUser(userId, filters);

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: transactions
      };
    } catch (error) {
      throw new Error(`Failed to fetch transactions by user: ${error.message}`);
    }
  }

  async getDashboardStats(filters = {}) {
    try {
      const stats = await TransactionRepository.getDashboardStats(filters);

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: stats
      };
    } catch (error) {
      throw new Error(`Failed to fetch transaction statistics: ${error.message}`);
    }
  }

  async getCategoryTransactionTotal(categoryId, filters = {}) {
    try {
      const category = await TransactionCategoryRepository.findById(categoryId);
      if (!category) {
        return {
          success: false,
          message: ERROR_MESSAGES.CATEGORY_NOT_FOUND,
          data: null
        };
      }

      const totalAmount = await TransactionRepository.getTotalTransactionByCategory(categoryId, filters);

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: {
          categoryId,
          categoryName: category.name,
          totalAmount,
          filters: filters
        }
      };
    } catch (error) {
      throw new Error(`Failed to calculate category transaction total: ${error.message}`);
    }
  }

  // Helper method to generate receipt numbers
  async generateReceiptNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const datePrefix = `TRX${year}${month}${day}`;
    
    let counter = 1;
    let receiptNumber = `${datePrefix}${String(counter).padStart(4, '0')}`;
    
    while (await TransactionRepository.getReceiptNumberExists(receiptNumber)) {
      counter++;
      receiptNumber = `${datePrefix}${String(counter).padStart(4, '0')}`;
    }
    
    return receiptNumber;
  }
}

export default new TransactionService();