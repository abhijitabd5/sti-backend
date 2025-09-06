// src/services/TransactionCategoryService.js

import TransactionCategoryRepository from "../repositories/TransactionCategoryRepository.js";
import { generateSlug } from "../utils/slugify.js";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../constants/messages.js";

class TransactionCategoryService {
  async getAllCategories(filters, currentUserId) {
    try {
      const result = await TransactionCategoryRepository.findAll(filters);

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: result.data,
        pagination: result.pagination,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch transaction categories: ${error.message}`
      );
    }
  }

  async getCategoryById(id) {
    try {
      const category = await TransactionCategoryRepository.findById(id);

      if (!category) {
        return {
          success: false,
          message: ERROR_MESSAGES.NOT_FOUND,
          data: null,
        };
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: category,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch transaction category: ${error.message}`
      );
    }
  }

  async getCategoryBySlug(slug) {
    try {
      const category = await TransactionCategoryRepository.findBySlug(slug);

      if (!category) {
        return {
          success: false,
          message: ERROR_MESSAGES.NOT_FOUND,
          data: null,
        };
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: category,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch transaction category: ${error.message}`
      );
    }
  }

  async createCategory(data, currentUserId) {
    try {
            console.log('AXA')
      const { name } = data;

      // Check if name already exists
      const nameExists =
        await TransactionCategoryRepository.checkNameExists(name);
      if (nameExists) {
        return {
          success: false,
          message: ERROR_MESSAGES.CATEGORY_NAME_EXISTS,
          data: null,
        };
      }

      // Generate unique slug
      const baseSlug = await generateSlug(name);
      let slug = baseSlug;
      let counter = 1;

      while (
        await TransactionCategoryRepository.checkSlugExists(slug)
      ) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Set display order
      const maxOrder =
        await TransactionCategoryRepository.getMaxDisplayOrder();
      const display_order = data.display_order || maxOrder + 1;

      const categoryData = {
        ...data,
        slug,
        display_order,
      };

      const category =
        await TransactionCategoryRepository.create(
          categoryData,
          currentUserId
        );

      return {
        success: true,
        message: SUCCESS_MESSAGES.CREATED,
        data: category,
      };
    } catch (error) {
      throw new Error(
        `Failed to create transaction category: ${error.message}`
      );
    }
  }

  async updateCategory(id, data, currentUserId) {
    try {
      const existingCategory =
        await TransactionCategoryRepository.findById(id);
      if (!existingCategory) {
        return {
          success: false,
          message: ERROR_MESSAGES.NOT_FOUND,
          data: null,
        };
      }

      // Check if name already exists (excluding current category)
      if (data.name) {
        const nameExists =
          await TransactionCategoryRepository.checkNameExists(
            data.name,
            id
          );
        if (nameExists) {
          return {
            success: false,
            message: ERROR_MESSAGES.CATEGORY_NAME_EXISTS,
            data: null,
          };
        }
      }

      // Generate new slug if name is being updated
      let updateData = { ...data };
      if (data.name && data.name !== existingCategory.name) {
        const baseSlug = await generateSlug(data.name);
        let slug = baseSlug;
        let counter = 1;

        while (
          await TransactionCategoryRepository.checkSlugExists(slug, id)
        ) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        updateData.slug = slug;
      }

      const updatedCategory =
        await TransactionCategoryRepository.update(
          id,
          updateData,
          currentUserId
        );

      return {
        success: true,
        message: SUCCESS_MESSAGES.UPDATED,
        data: updatedCategory,
      };
    } catch (error) {
      throw new Error(
        `Failed to update transaction category: ${error.message}`
      );
    }
  }

  async deleteCategory(id, currentUserId) {
    try {
      const category = await TransactionCategoryRepository.findById(id);
      if (!category) {
        return {
          success: false,
          message: ERROR_MESSAGES.NOT_FOUND,
          data: null,
        };
      }

      // Check if category has linked transactions
      const hasTransactions =
        await TransactionCategoryRepository.hasLinkedTransactions(id);
      if (hasTransactions) {
        return {
          success: false,
          message: ERROR_MESSAGES.CATEGORY_HAS_TRANSACTIONS,
          data: null,
        };
      }

      await TransactionCategoryRepository.delete(id, currentUserId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.DELETED,
        data: category,
      };
    } catch (error) {
      throw new Error(
        `Failed to delete transaction category: ${error.message}`
      );
    }
  }

  async reorderCategories(orderData, currentUserId) {
    try {
      for (const item of orderData) {
        const category = await TransactionCategoryRepository.findById(
          item.id
        );
        if (!category) {
          return {
            success: false,
            message: `Transaction category with ID ${item.id} not found`,
            data: null,
          };
        }
      }

      await TransactionCategoryRepository.updateDisplayOrders(
        orderData,
        currentUserId
      );

      return {
        success: true,
        message: SUCCESS_MESSAGES.CATEGORIES_REORDERED,
        data: null,
      };
    } catch (error) {
      throw new Error(
        `Failed to reorder transaction categories: ${error.message}`
      );
    }
  }

  async getCategoryStats() {
    try {
      const stats = await TransactionCategoryRepository.getStats();

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: stats,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch transaction category statistics: ${error.message}`
      );
    }
  }

  async checkCategoryUsage(id) {
    try {
      const category = await TransactionCategoryRepository.findById(id);
      if (!category) {
        return {
          success: false,
          message: ERROR_MESSAGES.NOT_FOUND,
          data: null,
        };
      }

      const hasTransactions =
        await TransactionCategoryRepository.hasLinkedTransactions(id);

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: {
          categoryId: id,
          categoryName: category.name,
          hasLinkedTransactions: hasTransactions,
          canDelete: !hasTransactions,
          transactionCount: category.transactions
            ? category.transactions.length
            : 0,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to check transaction category usage: ${error.message}`
      );
    }
  }
}

export default new TransactionCategoryService();