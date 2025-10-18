// src/services/TransactionService.js

import TransactionRepository from '../repositories/TransactionRepository.js';
import TransactionCategoryRepository from '../repositories/TransactionCategoryRepository.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants/messages.js';
import fs from "fs";
import path from "path";

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

   async deleteOldFile(filePath) {
    if (!filePath) return;

    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`Deleted old file: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }

  /**
   * Create new transaction
   */
  async createTransaction(data, currentUserId) {
    try {
      const { category_id, type } = data;

      // Validate type
      if (!type || !["income", "expense"].includes(type)) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_TYPE,
          data: null,
        };
      }

      // Validate category exists
      const category = await TransactionCategoryRepository.findById(category_id);
      if (!category) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_CATEGORY,
          data: null,
        };
      }

      const transactionData = {
        ...data,
        created_by: currentUserId,
      };

      const transaction = await TransactionRepository.create(
        transactionData,
        currentUserId
      );

      // Fetch created transaction with associations
      const createdTransaction = await TransactionRepository.findById(
        transaction.id
      );

      return {
        success: true,
        message: SUCCESS_MESSAGES.CREATED,
        data: createdTransaction,
      };
    } catch (error) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
  }

  /**
   * Update transaction
   */
  async updateTransaction(id, data, currentUserId) {
    try {
      const existingTransaction = await TransactionRepository.findById(id);

      if (!existingTransaction) {
        return {
          success: false,
          message: ERROR_MESSAGES.NOT_FOUND,
          data: null,
        };
      }

      // Handle attachment update
      if (data.attachment_path) {
        // Delete old attachment if exists and is different
        if (
          existingTransaction.attachment_path &&
          existingTransaction.attachment_path !== data.attachment_path
        ) {
          await this.deleteOldFile(existingTransaction.attachment_path);
        }
      }

      // Validate type if being updated
      if (data.type && !["income", "expense"].includes(data.type)) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_TYPE,
          data: null,
        };
      }

      // Validate category if being updated
      if (data.category_id) {
        const category = await TransactionCategoryRepository.findById(
          data.category_id
        );
        if (!category) {
          return {
            success: false,
            message: ERROR_MESSAGES.INVALID_CATEGORY,
            data: null,
          };
        }
      }

      const updatedTransaction = await TransactionRepository.update(
        id,
        data,
        currentUserId
      );

      return {
        success: true,
        message: SUCCESS_MESSAGES.UPDATED,
        data: updatedTransaction,
      };
    } catch (error) {
      throw new Error(`Failed to update transaction: ${error.message}`);
    }
  }

  // async createTransaction(data, currentUserId) {
  //   try {
  //     const { category_id, type } = data;

  //     // Validate type
  //     if (!type || !["income", "expense"].includes(type)) {
  //       return {
  //         success: false,
  //         message: ERROR_MESSAGES.INVALID_TYPE,
  //         data: null
  //       };
  //     }

  //     // Validate category exists
  //     const category = await TransactionCategoryRepository.findById(category_id);
  //     if (!category) {
  //       return {
  //         success: false,
  //         message: ERROR_MESSAGES.INVALID_CATEGORY,
  //         data: null
  //       };
  //     }

  //     const transactionData = {
  //       ...data,
  //       created_by: currentUserId
  //     };

  //     const transaction = await TransactionRepository.create(transactionData, currentUserId);

  //     // Fetch created transaction with associations
  //     const createdTransaction = await TransactionRepository.findById(transaction.id);

  //     return {
  //       success: true,
  //       message: SUCCESS_MESSAGES.CREATED,
  //       data: createdTransaction
  //     };
  //   } catch (error) {
  //     throw new Error(`Failed to create transaction: ${error.message}`);
  //   }
  // }

  // async updateTransaction(id, data, currentUserId) {
  //   try {
  //     const existingTransaction = await TransactionRepository.findById(id);
  //     if (!existingTransaction) {
  //       return {
  //         success: false,
  //         message: ERROR_MESSAGES.NOT_FOUND,
  //         data: null
  //       };
  //     }

  //     // Validate type if being updated
  //     if (data.type && !["income", "expense"].includes(data.type)) {
  //       return {
  //         success: false,
  //         message: ERROR_MESSAGES.INVALID_TYPE,
  //         data: null
  //       };
  //     }

  //     // Validate category if being updated
  //     if (data.category_id) {
  //       const category = await TransactionCategoryRepository.findById(data.category_id);
  //       if (!category) {
  //         return {
  //           success: false,
  //           message: ERROR_MESSAGES.INVALID_CATEGORY,
  //           data: null
  //         };
  //       }
  //     }

  //     const updatedTransaction = await TransactionRepository.update(id, data, currentUserId);

  //     return {
  //       success: true,
  //       message: SUCCESS_MESSAGES.UPDATED,
  //       data: updatedTransaction
  //     };
  //   } catch (error) {
  //     throw new Error(`Failed to update transaction: ${error.message}`);
  //   }
  // }

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
}

export default new TransactionService();