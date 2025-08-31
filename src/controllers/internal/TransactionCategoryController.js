// src/controllers/internal/TransactionCategoryController.js

import TransactionCategoryService from "../../services/TransactionCategoryService.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  createResponse,
  notFoundResponse,
  validationErrorResponse,
} from "../../utils/responseFormatter.js";
import { ERROR_MESSAGES } from "../../constants/messages.js";

class TransactionCategoryController {
  static async getAllCategories(req, res) {
    try {
      const filters = {
        search: req.query.search,
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        sortBy: req.query.sortBy || "display_order",
        sortOrder: req.query.sortOrder || "ASC",
      };

      const result = await TransactionCategoryService.getAllCategories(
        filters,
        req.user.id
      );

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return paginatedResponse(
        res,
        result.data,
        result.pagination,
        result.message
      );
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getCategoryById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return validationErrorResponse(res, {
          id: "Valid category ID is required",
        });
      }

      const result = await TransactionCategoryService.getCategoryById(id);

      if (!result.success) {
        return notFoundResponse(res, result.message);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getCategoryBySlug(req, res) {
    try {
      const { slug } = req.params;

      if (!slug) {
        return validationErrorResponse(res, {
          slug: "Category slug is required",
        });
      }

      const result = await TransactionCategoryService.getCategoryBySlug(slug);

      if (!result.success) {
        return notFoundResponse(res, result.message);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async createCategory(req, res) {
    try {
      const { name, display_order, type } = req.body;

      // Basic validation
      if (!name || name.trim().length === 0) {
        return validationErrorResponse(res, {
          name: "Category name is required",
        });
      }

      if (name.trim().length < 2) {
        return validationErrorResponse(res, {
          name: "Category name must be at least 2 characters long",
        });
      }

      if (display_order && (isNaN(display_order) || display_order < 0)) {
        return validationErrorResponse(res, {
          display_order: "Display order must be a valid positive number",
        });
      }

      if (!type || !["income", "expense"].includes(type)) {
        return validationErrorResponse(res, {
          type: "Category type must be either 'income' or 'expense'",
        });
      }

      const categoryData = {
        name: name.trim(),
        display_order: display_order ? parseInt(display_order) : undefined,
        type,
      };

      const result = await TransactionCategoryService.createCategory(
        categoryData,
        req.user.id
      );

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return createResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, display_order, type } = req.body;

      if (!id || isNaN(id)) {
        return validationErrorResponse(res, {
          id: "Valid category ID is required",
        });
      }

      // Validate fields if provided
      const updateData = {};

      if (name !== undefined) {
        if (!name || name.trim().length === 0) {
          return validationErrorResponse(res, {
            name: "Category name cannot be empty",
          });
        }
        if (name.trim().length < 2) {
          return validationErrorResponse(res, {
            name: "Category name must be at least 2 characters long",
          });
        }
        updateData.name = name.trim();
      }

      if (display_order !== undefined) {
        if (isNaN(display_order) || display_order < 0) {
          return validationErrorResponse(res, {
            display_order: "Display order must be a valid positive number",
          });
        }
        updateData.display_order = parseInt(display_order);
      }

      if (type !== undefined) {
        if (!["income", "expense"].includes(type)) {
          return validationErrorResponse(res, {
            type: "Category type must be either 'income' or 'expense'",
          });
        }
        updateData.type = type;
      }

      const result = await TransactionCategoryService.updateCategory(
        id,
        updateData,
        req.user.id
      );

      if (!result.success) {
        if (result.message === ERROR_MESSAGES.NOT_FOUND) {
          return notFoundResponse(res, result.message);
        }
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return validationErrorResponse(res, {
          id: "Valid category ID is required",
        });
      }

      const result = await TransactionCategoryService.deleteCategory(
        id,
        req.user.id
      );

      if (!result.success) {
        if (result.message === ERROR_MESSAGES.NOT_FOUND) {
          return notFoundResponse(res, result.message);
        }
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async reorderCategories(req, res) {
    try {
      const { orders } = req.body;

      if (!orders || !Array.isArray(orders)) {
        return validationErrorResponse(res, {
          orders: "Orders array is required",
        });
      }

      for (const order of orders) {
        if (!order.id || isNaN(order.id)) {
          return validationErrorResponse(res, {
            orders: "Each order must have a valid ID",
          });
        }
        if (
          order.display_order === undefined ||
          isNaN(order.display_order)
        ) {
          return validationErrorResponse(res, {
            orders: "Each order must have a valid display_order",
          });
        }
      }

      const result = await TransactionCategoryService.reorderCategories(
        orders,
        req.user.id
      );

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, null, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getCategoryStats(req, res) {
    try {
      const result = await TransactionCategoryService.getCategoryStats();

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async checkCategoryUsage(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return validationErrorResponse(res, {
          id: "Valid category ID is required",
        });
      }

      const result = await TransactionCategoryService.checkCategoryUsage(id);

      if (!result.success) {
        return notFoundResponse(res, result.message);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}

export default TransactionCategoryController;