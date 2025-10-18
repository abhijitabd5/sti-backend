// src/validations/expenseValidation.js
import Joi from 'joi';

// Expense Category Validation Schemas
export const createExpenseCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Category name is required',
      'string.min': 'Category name must be at least 2 characters long',
      'string.max': 'Category name must not exceed 100 characters',
      'any.required': 'Category name is required'
    }),
  
  display_order: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Display order must be a number',
      'number.integer': 'Display order must be an integer',
      'number.min': 'Display order must be 0 or greater'
    })
});

export const updateExpenseCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.empty': 'Category name cannot be empty',
      'string.min': 'Category name must be at least 2 characters long',
      'string.max': 'Category name must not exceed 100 characters'
    }),
  
  display_order: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Display order must be a number',
      'number.integer': 'Display order must be an integer',
      'number.min': 'Display order must be 0 or greater'
    })
});

export const reorderCategoriesSchema = Joi.object({
  orders: Joi.array()
    .items(
      Joi.object({
        id: Joi.number()
          .integer()
          .positive()
          .required()
          .messages({
            'number.base': 'Category ID must be a number',
            'number.integer': 'Category ID must be an integer',
            'number.positive': 'Category ID must be positive',
            'any.required': 'Category ID is required'
          }),
        
        display_order: Joi.number()
          .integer()
          .min(0)
          .required()
          .messages({
            'number.base': 'Display order must be a number',
            'number.integer': 'Display order must be an integer',
            'number.min': 'Display order must be 0 or greater',
            'any.required': 'Display order is required'
          })
      })
    )
    .min(1)
    .required()
    .messages({
      'array.base': 'Orders must be an array',
      'array.min': 'At least one order item is required',
      'any.required': 'Orders array is required'
    })
});

// Expense Validation Schemas
export const createExpenseSchema = Joi.object({
  category_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Category ID must be a number',
      'number.integer': 'Category ID must be an integer',
      'number.positive': 'Category ID must be positive',
      'any.required': 'Expense category is required'
    }),

  amount: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.base': 'Amount must be a number',
      'number.positive': 'Amount must be greater than 0',
      'any.required': 'Amount is required'
    }),

  expense_by: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Expense by must be a number',
      'number.integer': 'Expense by must be an integer',
      'number.positive': 'Expense by must be positive'
    }),

  expense_date: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'Expense date must be a valid date',
      'date.iso': 'Expense date must be in YYYY-MM-DD format',
      'any.required': 'Expense date is required'
    }),

  description: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description must not exceed 500 characters'
    }),

  payment_mode: Joi.string()
    .valid('cash', 'cheque', 'upi', 'bank_transfer', 'card', 'online')
    .required()
    .messages({
      'any.only': 'Payment mode must be one of: cash, cheque, upi, bank_transfer, card, online',
      'any.required': 'Payment mode is required'
    }),

  cheque_number: Joi.string()
    .trim()
    .max(50)
    .when('payment_mode', {
      is: 'cheque',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'string.max': 'Cheque number must not exceed 50 characters',
      'any.required': 'Cheque number is required for cheque payments'
    }),

  receipt_number: Joi.string()
    .trim()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Receipt number must not exceed 50 characters'
    }),

  transaction_id: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Transaction ID must not exceed 100 characters'
    }),

  payer_upi_id: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Payer UPI ID must not exceed 100 characters'
    }),

  payee_name: Joi.string()
    .trim()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Payee name must not exceed 200 characters'
    }),

  payee_contact: Joi.string()
    .trim()
    .max(15)
    .optional()
    .messages({
      'string.max': 'Payee contact must not exceed 15 characters'
    }),

  payee_bank_name: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Payee bank name must not exceed 100 characters'
    }),

  payee_account_number: Joi.string()
    .trim()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Payee account number must not exceed 50 characters'
    }),

  payee_upi_id: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Payee UPI ID must not exceed 100 characters'
    }),

  reference_note: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Reference note must not exceed 1000 characters'
    })
});

export const updateExpenseSchema = Joi.object({
  category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Category ID must be a number',
      'number.integer': 'Category ID must be an integer',
      'number.positive': 'Category ID must be positive'
    }),

  amount: Joi.number()
    .positive()
    .precision(2)
    .optional()
    .messages({
      'number.base': 'Amount must be a number',
      'number.positive': 'Amount must be greater than 0'
    }),

  expense_by: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Expense by must be a number',
      'number.integer': 'Expense by must be an integer',
      'number.positive': 'Expense by must be positive'
    }),

  expense_date: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Expense date must be a valid date',
      'date.iso': 'Expense date must be in YYYY-MM-DD format'
    }),

  description: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description must not exceed 500 characters'
    }),

  payment_mode: Joi.string()
    .valid('cash', 'cheque', 'upi', 'bank_transfer', 'card', 'online')
    .optional()
    .messages({
      'any.only': 'Payment mode must be one of: cash, cheque, upi, bank_transfer, card, online'
    }),

  cheque_number: Joi.string()
    .trim()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Cheque number must not exceed 50 characters'
    }),

  receipt_number: Joi.string()
    .trim()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Receipt number must not exceed 50 characters'
    }),

  transaction_id: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Transaction ID must not exceed 100 characters'
    }),

  payer_upi_id: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Payer UPI ID must not exceed 100 characters'
    }),

  payee_name: Joi.string()
    .trim()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Payee name must not exceed 200 characters'
    }),

  payee_contact: Joi.string()
    .trim()
    .max(15)
    .optional()
    .messages({
      'string.max': 'Payee contact must not exceed 15 characters'
    }),

  payee_bank_name: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Payee bank name must not exceed 100 characters'
    }),

  payee_account_number: Joi.string()
    .trim()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Payee account number must not exceed 50 characters'
    }),

  payee_upi_id: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Payee UPI ID must not exceed 100 characters'
    }),

  reference_note: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Reference note must not exceed 1000 characters'
    })
});

// Query parameter validation schemas
export const expenseQuerySchema = Joi.object({
  search: Joi.string().trim().optional(),
  categoryId: Joi.number().integer().positive().optional(),
  expenseBy: Joi.number().integer().positive().optional(),
  paymentMode: Joi.string().valid('cash', 'cheque', 'upi', 'bank_transfer', 'card', 'online').optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().min(Joi.ref('dateFrom')).optional(),
  amountMin: Joi.number().positive().optional(),
  amountMax: Joi.number().positive().min(Joi.ref('amountMin')).optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sortBy: Joi.string().valid('expense_date', 'amount', 'category_id', 'payment_mode', 'createdAt').optional(),
  sortOrder: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').optional()
});

export const categoryQuerySchema = Joi.object({
  search: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sortBy: Joi.string().valid('display_order', 'name', 'createdAt').optional(),
  sortOrder: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').optional()
});