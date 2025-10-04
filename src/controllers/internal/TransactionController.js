// src/controllers/internal/TransactionController.js

import TransactionService from "../../services/TransactionService.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  createResponse,
  notFoundResponse,
  validationErrorResponse,
} from "../../utils/responseFormatter.js";
import { ERROR_MESSAGES } from "../../constants/messages.js";
import fs from "fs";

class TransactionController {
  static async getAllTransactions(req, res) {
    try {
      const filters = {
        search: req.query.search,
        categoryId: req.query.categoryId,
        type: req.query.type, // income/expense
        paymentMode: req.query.paymentMode,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        amountMin: req.query.amountMin,
        amountMax: req.query.amountMax,
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        sortBy: req.query.sortBy || "transaction_date",
        sortOrder: req.query.sortOrder || "DESC",
      };

      const result = await TransactionService.getAllTransactions(
        filters,
        req.user.id
      );

      if (!result.success) {
        return errorResponse(res, result.message);
      }

      return paginatedResponse(
        res,
        result.data,
        result.pagination,
        result.message
      );
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  static async getTransactionById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return validationErrorResponse(res, {
          id: "Valid transaction ID is required",
        });
      }

      const result = await TransactionService.getTransactionById(id);

      if (!result.success) {
        return notFoundResponse(res, result.message);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

    /**
   * Create new transaction with attachment upload
   * @route POST /api/internal/transactions
   * @access Private (Admin, Account)
   */
  static async createTransaction(req, res) {
    try {
      // Extract form data
      const transactionData = {
        ...req.body,
        // Handle file upload
        attachment_path: req.file ? req.file.path : null,
      };

      // Parse numeric fields
      if (transactionData.category_id) {
        transactionData.category_id = parseInt(transactionData.category_id);
      }
      if (transactionData.amount) {
        transactionData.amount = parseFloat(transactionData.amount);
      }
      if (transactionData.expense_for_user) {
        transactionData.expense_for_user = parseInt(transactionData.expense_for_user);
      }

      // Trim string fields
      const stringFields = [
        "description",
        "payment_ref_num",
        "payer_name",
        "payer_contact",
        "payer_bank_name",
        "payer_account_number",
        "payer_upi_id",
        "payee_name",
        "payee_contact",
        "payee_bank_name",
        "payee_account_number",
        "payee_upi_id",
        "reference_note",
      ];

      stringFields.forEach((field) => {
        if (transactionData[field]) {
          transactionData[field] = transactionData[field].trim();
        }
      });

      // Basic validation
      const errors = {};

      if (!transactionData.type || !["income", "expense"].includes(transactionData.type)) {
        errors.type = "Valid transaction type (income/expense) is required";
      }

      if (!transactionData.category_id || isNaN(transactionData.category_id)) {
        errors.category_id = "Valid transaction category is required";
      }

      if (!transactionData.amount || isNaN(transactionData.amount) || transactionData.amount <= 0) {
        errors.amount = "Valid amount greater than 0 is required";
      }

      if (!transactionData.transaction_date) {
        errors.transaction_date = "Transaction date is required";
      } else {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(transactionData.transaction_date)) {
          errors.transaction_date = "Transaction date must be in YYYY-MM-DD format";
        }
      }

      if (!transactionData.payment_mode) {
        errors.payment_mode = "Payment mode is required";
      } else {
        const validPaymentModes = ["cash", "cheque", "upi", "bank_transfer", "card", "online"];
        if (!validPaymentModes.includes(transactionData.payment_mode)) {
          errors.payment_mode = "Invalid payment mode";
        }
      }

      if (transactionData.payment_ref_type && !["receipt", "transaction", "cheque", "invoice", "other"].includes(transactionData.payment_ref_type)) {
        errors.payment_ref_type = "Invalid payment reference type";
      }

      if (transactionData.attachment_type && !["invoice", "receipt", "proof", "other"].includes(transactionData.attachment_type)) {
        errors.attachment_type = "Invalid attachment type";
      }

      if (transactionData.expense_for_user && isNaN(transactionData.expense_for_user)) {
        errors.expense_for_user = "Valid user ID is required for expense_for_user";
      }

      if (Object.keys(errors).length > 0) {
        // Delete uploaded file if validation failed
        if (req.file) {
          fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }
        return validationErrorResponse(res, errors);
      }

      // Normalize file path
      if (transactionData.attachment_path) {
        transactionData.attachment_path = transactionData.attachment_path.replace(/\\/g, "/");
      }

      const result = await TransactionService.createTransaction(
        transactionData,
        req.user.id
      );

      if (!result.success) {
        // Delete uploaded file if creation failed
        if (req.file) {
          fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }
        return errorResponse(res, result.message);
      }

      return createResponse(res, result.data, result.message);
    } catch (error) {
      // Delete uploaded file on error
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
      return errorResponse(res, error.message);
    }
  }

  /**
   * Update transaction with optional attachment upload
   * @route PUT /api/internal/transactions/:id
   * @access Private (Admin, Account)
   */
  static async updateTransaction(req, res) {
    console.log("I am here")
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return validationErrorResponse(res, {
          id: "Valid transaction ID is required",
        });
      }

      // Extract form data
      const updateData = { ...req.body };

      // Handle file upload (only if new file is uploaded)
      if (req.file) {
        updateData.attachment_path = req.file.path.replace(/\\/g, "/");
        updateData.old_attachment = req.body.old_attachment;
      }

      const errors = {};

      if (updateData.type && !["income", "expense"].includes(updateData.type)) {
        errors.type = "Transaction type must be income or expense";
      }

      if (updateData.category_id) {
        if (isNaN(updateData.category_id)) {
          errors.category_id = "Valid transaction category is required";
        } else {
          updateData.category_id = parseInt(updateData.category_id);
        }
      }

      if (updateData.amount) {
        if (isNaN(updateData.amount) || parseFloat(updateData.amount) <= 0) {
          errors.amount = "Valid amount greater than 0 is required";
        } else {
          updateData.amount = parseFloat(updateData.amount);
        }
      }

      if (updateData.transaction_date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(updateData.transaction_date)) {
          errors.transaction_date = "Transaction date must be in YYYY-MM-DD format";
        }
      }

      if (updateData.payment_mode) {
        const validPaymentModes = ["cash", "cheque", "upi", "bank_transfer", "card", "online"];
        if (!validPaymentModes.includes(updateData.payment_mode)) {
          errors.payment_mode = "Invalid payment mode";
        }
      }

      if (updateData.payment_ref_type && !["receipt", "transaction", "cheque", "invoice", "other"].includes(updateData.payment_ref_type)) {
        errors.payment_ref_type = "Invalid payment reference type";
      }

      if (updateData.attachment_type && !["invoice", "receipt", "proof", "other"].includes(updateData.attachment_type)) {
        errors.attachment_type = "Invalid attachment type";
      }

      if (updateData.expense_for_user && isNaN(updateData.expense_for_user)) {
        errors.expense_for_user = "Valid user ID is required for expense_for_user";
      }

      if (Object.keys(errors).length > 0) {
        // Delete uploaded file if validation failed
        if (req.file) {
          fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }
        return validationErrorResponse(res, errors);
      }

      // Trim string fields
      const stringFields = [
        "description",
        "payment_ref_num",
        "payer_name",
        "payer_contact",
        "payer_bank_name",
        "payer_account_number",
        "payer_upi_id",
        "payee_name",
        "payee_contact",
        "payee_bank_name",
        "payee_account_number",
        "payee_upi_id",
        "reference_note",
      ];

      stringFields.forEach((field) => {
        if (updateData[field]) {
          updateData[field] = updateData[field].trim();
        }
      });

      // Handle expense_for_user conversion
      if (updateData.expense_for_user) {
        updateData.expense_for_user = parseInt(updateData.expense_for_user);
      }

      const result = await TransactionService.updateTransaction(
        id,
        updateData,
        req.user.id
      );

      if (!result.success) {
        // Delete uploaded file if update failed
        if (req.file) {
          fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }

        if (result.message === ERROR_MESSAGES.NOT_FOUND) {
          return notFoundResponse(res, result.message);
        }
        return errorResponse(res, result.message);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      // Delete uploaded file on error
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
      return errorResponse(res, error.message);
    }
  }

  // static async createTransaction(req, res) {
  //   try {
  //     const {
  //       type,
  //       category_id,
  //       amount,
  //       transaction_date,
  //       description,
  //       payment_mode,
  //       payment_ref_num,
  //       payment_ref_type,
  //       payer_name,
  //       payer_contact,
  //       payer_bank_name,
  //       payer_account_number,
  //       payer_upi_id,
  //       payee_name,
  //       payee_contact,
  //       payee_bank_name,
  //       payee_account_number,
  //       payee_upi_id,
  //       reference_note,
  //       expense_for_user,
  //       attachment_path,
  //       attachment_type,
  //     } = req.body;

  //     // Basic validation
  //     const errors = {};

  //     if (!type || !["income", "expense"].includes(type)) {
  //       errors.type = "Valid transaction type (income/expense) is required";
  //     }

  //     if (!category_id || isNaN(category_id)) {
  //       errors.category_id = "Valid transaction category is required";
  //     }

  //     if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
  //       errors.amount = "Valid amount greater than 0 is required";
  //     }

  //     if (!transaction_date) {
  //       errors.transaction_date = "Transaction date is required";
  //     } else {
  //       const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  //       if (!dateRegex.test(transaction_date)) {
  //         errors.transaction_date =
  //           "Transaction date must be in YYYY-MM-DD format";
  //       }
  //     }

  //     if (!payment_mode) {
  //       errors.payment_mode = "Payment mode is required";
  //     } else {
  //       const validPaymentModes = [
  //         "cash",
  //         "cheque",
  //         "upi",
  //         "bank_transfer",
  //         "card",
  //         "online",
  //       ];
  //       if (!validPaymentModes.includes(payment_mode)) {
  //         errors.payment_mode = "Invalid payment mode";
  //       }
  //     }

  //     if (payment_ref_type && !["receipt", "transaction", "cheque", "invoice", "other"].includes(payment_ref_type)) {
  //       errors.payment_ref_type = "Invalid payment reference type";
  //     }

  //     if (attachment_type && !["invoice", "receipt", "proof", "other"].includes(attachment_type)) {
  //       errors.attachment_type = "Invalid attachment type";
  //     }

  //     if (expense_for_user && isNaN(expense_for_user)) {
  //       errors.expense_for_user = "Valid user ID is required for expense_for_user";
  //     }

  //     if (Object.keys(errors).length > 0) {
  //       return validationErrorResponse(res, errors);
  //     }

  //     const transactionData = {
  //       type,
  //       category_id: parseInt(category_id),
  //       amount: parseFloat(amount),
  //       transaction_date,
  //       description: description?.trim(),
  //       payment_mode,
  //       payment_ref_num: payment_ref_num?.trim(),
  //       payment_ref_type,
  //       payer_name: payer_name?.trim(),
  //       payer_contact: payer_contact?.trim(),
  //       payer_bank_name: payer_bank_name?.trim(),
  //       payer_account_number: payer_account_number?.trim(),
  //       payer_upi_id: payer_upi_id?.trim(),
  //       payee_name: payee_name?.trim(),
  //       payee_contact: payee_contact?.trim(),
  //       payee_bank_name: payee_bank_name?.trim(),
  //       payee_account_number: payee_account_number?.trim(),
  //       payee_upi_id: payee_upi_id?.trim(),
  //       reference_note: reference_note?.trim(),
  //       expense_for_user: expense_for_user ? parseInt(expense_for_user) : null,
  //       attachment_path: attachment_path?.trim(),
  //       attachment_type: attachment_type || 'invoice',
  //     };

  //     const result = await TransactionService.createTransaction(
  //       transactionData,
  //       req.user.id
  //     );

  //     if (!result.success) {
  //       return errorResponse(res, result.message);
  //     }

  //     return createResponse(res, result.data, result.message);
  //   } catch (error) {
  //     return errorResponse(res, error.message);
  //   }
  // }

  // static async updateTransaction(req, res) {
  //   try {
  //     const { id } = req.params;
  //     const updateData = { ...req.body };

  //     if (!id || isNaN(id)) {
  //       return validationErrorResponse(res, {
  //         id: "Valid transaction ID is required",
  //       });
  //     }

  //     const errors = {};

  //     if (updateData.type && !["income", "expense"].includes(updateData.type)) {
  //       errors.type = "Transaction type must be income or expense";
  //     }

  //     if (updateData.category_id && isNaN(updateData.category_id)) {
  //       errors.category_id = "Valid transaction category is required";
  //     } else if (updateData.category_id) {
  //       updateData.category_id = parseInt(updateData.category_id);
  //     }

  //     if (updateData.amount) {
  //       if (isNaN(updateData.amount) || parseFloat(updateData.amount) <= 0) {
  //         errors.amount = "Valid amount greater than 0 is required";
  //       } else {
  //         updateData.amount = parseFloat(updateData.amount);
  //       }
  //     }

  //     if (updateData.transaction_date) {
  //       const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  //       if (!dateRegex.test(updateData.transaction_date)) {
  //         errors.transaction_date =
  //           "Transaction date must be in YYYY-MM-DD format";
  //       }
  //     }

  //     if (updateData.payment_mode) {
  //       const validPaymentModes = [
  //         "cash",
  //         "cheque",
  //         "upi",
  //         "bank_transfer",
  //         "card",
  //         "online",
  //       ];
  //       if (!validPaymentModes.includes(updateData.payment_mode)) {
  //         errors.payment_mode = "Invalid payment mode";
  //       }
  //     }

  //     if (updateData.payment_ref_type && !["receipt", "transaction", "cheque", "invoice", "other"].includes(updateData.payment_ref_type)) {
  //       errors.payment_ref_type = "Invalid payment reference type";
  //     }

  //     if (updateData.attachment_type && !["invoice", "receipt", "proof", "other"].includes(updateData.attachment_type)) {
  //       errors.attachment_type = "Invalid attachment type";
  //     }

  //     if (updateData.expense_for_user && isNaN(updateData.expense_for_user)) {
  //       errors.expense_for_user = "Valid user ID is required for expense_for_user";
  //     }

  //     if (Object.keys(errors).length > 0) {
  //       return validationErrorResponse(res, errors);
  //     }

  //     // Trim string fields and handle type conversions
  //     const stringFields = [
  //       "description",
  //       "payment_ref_num",
  //       "payer_name",
  //       "payer_contact",
  //       "payer_bank_name",
  //       "payer_account_number",
  //       "payer_upi_id",
  //       "payee_name",
  //       "payee_contact",
  //       "payee_bank_name",
  //       "payee_account_number",
  //       "payee_upi_id",
  //       "reference_note",
  //       "attachment_path",
  //     ];

  //     stringFields.forEach((field) => {
  //       if (updateData[field]) {
  //         updateData[field] = updateData[field].trim();
  //       }
  //     });

  //     // Handle expense_for_user conversion
  //     if (updateData.expense_for_user) {
  //       updateData.expense_for_user = parseInt(updateData.expense_for_user);
  //     }

  //     const result = await TransactionService.updateTransaction(
  //       id,
  //       updateData,
  //       req.user.id
  //     );

  //     if (!result.success) {
  //       if (result.message === ERROR_MESSAGES.NOT_FOUND) {
  //         return notFoundResponse(res, result.message);
  //       }
  //       return errorResponse(res, result.message);
  //     }

  //     return successResponse(res, result.data, result.message);
  //   } catch (error) {
  //     return errorResponse(res, error.message);
  //   }
  // }

  static async deleteTransaction(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return validationErrorResponse(res, {
          id: "Valid transaction ID is required",
        });
      }

      const result = await TransactionService.deleteTransaction(
        id,
        req.user.id
      );

      if (!result.success) {
        if (result.message === ERROR_MESSAGES.NOT_FOUND) {
          return notFoundResponse(res, result.message);
        }
        return errorResponse(res, result.message);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  static async getDashboardStats(req, res) {
    try {
      const { dateFrom, dateTo } = req.query;
      const filters = { dateFrom, dateTo };

      const result = await TransactionService.getDashboardStats(filters);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getTransactionsByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { dateFrom, dateTo, limit } = req.query;

      if (!categoryId || isNaN(categoryId)) {
        return validationErrorResponse(res, {
          categoryId: "Valid category ID is required",
        });
      }

      const filters = { dateFrom, dateTo, limit: limit || 10 };
      const result = await TransactionService.getTransactionsByCategory(
        categoryId,
        filters
      );

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getTransactionsByUser(req, res) {
    try {
      const { userId } = req.params;
      const { dateFrom, dateTo, limit } = req.query;

      if (!userId || isNaN(userId)) {
        return validationErrorResponse(res, {
          userId: "Valid user ID is required",
        });
      }

      const filters = { dateFrom, dateTo, limit: limit || 10 };
      const result = await TransactionService.getTransactionsByUser(
        userId,
        filters
      );

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getCategoryTransactionTotal(req, res) {
    try {
      const { categoryId } = req.params;
      const { dateFrom, dateTo } = req.query;

      if (!categoryId || isNaN(categoryId)) {
        return validationErrorResponse(res, {
          categoryId: "Valid category ID is required",
        });
      }

      const filters = { dateFrom, dateTo };
      const result = await TransactionService.getCategoryTransactionTotal(
        categoryId,
        filters
      );

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}

export default TransactionController;