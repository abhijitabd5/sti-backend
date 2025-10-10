// src/validations/reviewValidation.js
import Joi from 'joi';

/**
 * Validation schema for creating a review
 */
export const createReviewSchema = Joi.object({
  student_id: Joi.number().integer().positive().allow(null).optional(),
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required'
  }),
  city: Joi.string().max(100).allow(null, '').optional(),
  phone: Joi.string().pattern(/^[0-9+\-\s()]*$/).max(15).allow(null, '').optional().messages({
    'string.pattern.base': 'Phone number format is invalid'
  }),
  review_text: Joi.string().min(10).max(1000).required().messages({
    'string.empty': 'Review text is required',
    'string.min': 'Review text must be at least 10 characters',
    'string.max': 'Review text cannot exceed 1000 characters',
    'any.required': 'Review text is required'
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.base': 'Rating must be a number',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5',
    'any.required': 'Rating is required'
  }),
  is_enrolled_student: Joi.boolean().optional(),
  qr_code_url: Joi.string().uri().max(500).optional()
});

/**
 * Validation schema for updating a review
 */
export const updateReviewSchema = Joi.object({
  student_id: Joi.number().integer().positive().allow(null).optional(),
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 100 characters'
  }),
  city: Joi.string().max(100).allow(null, '').optional(),
  phone: Joi.string().pattern(/^[0-9+\-\s()]*$/).max(15).allow(null, '').optional().messages({
    'string.pattern.base': 'Phone number format is invalid'
  }),
  review_text: Joi.string().min(10).max(1000).optional().messages({
    'string.min': 'Review text must be at least 10 characters',
    'string.max': 'Review text cannot exceed 1000 characters'
  }),
  rating: Joi.number().integer().min(1).max(5).optional().messages({
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5'
  }),
  is_enrolled_student: Joi.boolean().optional(),
  display_order: Joi.number().integer().min(0).optional(),
  qr_code_url: Joi.string().uri().max(500).optional()
}).min(1); // At least one field must be provided

/**
 * Validation schema for changing approval status
 */
export const approvalStatusSchema = Joi.object({
  is_approved: Joi.boolean().required().messages({
    'any.required': 'Approval status (is_approved) is required',
    'boolean.base': 'Approval status must be a boolean value'
  })
});

/**
 * Validation schema for reordering reviews
 */
export const reorderReviewsSchema = Joi.object({
  reviews: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().positive().required().messages({
          'any.required': 'Review ID is required',
          'number.base': 'Review ID must be a number',
          'number.positive': 'Review ID must be positive'
        }),
        display_order: Joi.number().integer().min(0).required().messages({
          'any.required': 'Display order is required',
          'number.base': 'Display order must be a number',
          'number.min': 'Display order cannot be negative'
        })
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one review must be provided',
      'any.required': 'Reviews array is required'
    })
});

/**
 * Validation schema for query parameters
 */
export const reviewQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().allow('').optional(),
  is_approved: Joi.boolean().optional(),
  is_enrolled_student: Joi.boolean().optional(),
  rating: Joi.number().integer().min(1).max(5).optional(),
  student_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('display_order', 'rating', 'createdAt', 'name').optional(),
  sortOrder: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').optional()
});