// src/validations/galleryValidation.js
import Joi from 'joi';

// Create gallery item validation
export const createGalleryItemSchema = Joi.object({
  title: Joi.string().required().max(255).messages({
    'string.empty': 'Title is required',
    'string.max': 'Title cannot exceed 255 characters'
  }),
  caption: Joi.string().allow('').max(1000).messages({
    'string.max': 'Caption cannot exceed 1000 characters'
  }),
  media_type: Joi.string().valid('photo', 'video').required().messages({
    'any.only': 'Media type must be either "photo" or "video"',
    'any.required': 'Media type is required'
  }),
  page_slug: Joi.string().required().max(100).messages({
    'string.empty': 'Page slug is required',
    'string.max': 'Page slug cannot exceed 100 characters'
  }),
  display_order: Joi.number().integer().min(0).default(0),
  is_media_remote: Joi.boolean().default(false),
  is_thumbnail_remote: Joi.boolean().default(false),
  media_path: Joi.string().allow('').max(500).when('is_media_remote', {
    is: true,
    then: Joi.required().messages({
      'any.required': 'Remote media URL is required when is_media_remote is true'
    })
  }).messages({
    'string.max': 'Media path cannot exceed 500 characters'
  }),
  thumbnail_path: Joi.string().allow('').max(500).when('media_type', {
    is: 'video',
    then: Joi.when('is_thumbnail_remote', {
      is: true,
      then: Joi.required().messages({
        'any.required': 'Remote thumbnail URL is required for videos when is_thumbnail_remote is true'
      })
    })
  }).messages({
    'string.max': 'Thumbnail path cannot exceed 500 characters'
  })
});

// Update gallery item validation
export const updateGalleryItemSchema = Joi.object({
  title: Joi.string().max(255).messages({
    'string.max': 'Title cannot exceed 255 characters'
  }),
  caption: Joi.string().allow('').max(1000).messages({
    'string.max': 'Caption cannot exceed 1000 characters'
  }),
  page_slug: Joi.string().max(100).messages({
    'string.max': 'Page slug cannot exceed 100 characters'
  }),
  display_order: Joi.number().integer().min(0),
  is_media_remote: Joi.boolean(),
  is_thumbnail_remote: Joi.boolean(),
  media_path: Joi.string().allow('').max(500).messages({
    'string.max': 'Media path cannot exceed 500 characters'
  }),
  thumbnail_path: Joi.string().allow('').max(500).messages({
    'string.max': 'Thumbnail path cannot exceed 500 characters'
  })
});

// Status update validation
export const updateStatusSchema = Joi.object({
  is_active: Joi.boolean().required().messages({
    'any.required': 'is_active field is required',
    'boolean.base': 'is_active must be a boolean value'
  })
});

// Bulk upload validation
export const bulkUploadSchema = Joi.object({
  title: Joi.string().max(255).default('Gallery Item').messages({
    'string.max': 'Title cannot exceed 255 characters'
  }),
  caption: Joi.string().allow('').max(1000).messages({
    'string.max': 'Caption cannot exceed 1000 characters'
  }),
  page_slug: Joi.string().required().max(100).messages({
    'string.empty': 'Page slug is required',
    'string.max': 'Page slug cannot exceed 100 characters'
  }),
  display_order: Joi.number().integer().min(0).default(0)
});

// Reorder validation
export const reorderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      id: Joi.number().integer().positive().required().messages({
        'any.required': 'Item ID is required',
        'number.positive': 'Item ID must be a positive number'
      }),
      display_order: Joi.number().integer().min(0).required().messages({
        'any.required': 'Display order is required',
        'number.min': 'Display order must be 0 or greater'
      })
    })
  ).min(1).required().messages({
    'array.min': 'At least one item is required',
    'any.required': 'Items array is required'
  })
});

// Query filters validation
export const galleryFiltersSchema = Joi.object({
  page: Joi.number().integer().positive().default(1),
  limit: Joi.number().integer().positive().max(100).default(20),
  page_slug: Joi.string().max(100),
  media_type: Joi.string().valid('photo', 'video'),
  status: Joi.string().valid('active', 'inactive'),
  search: Joi.string().max(255)
});

// Validation middleware function
export const validateGalleryRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = {};
      error.details.forEach(detail => {
        errors[detail.path.join('.')] = detail.message;
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
        timestamp: new Date().toISOString()
      });
    }

    req.body = value;
    next();
  };
};

// Validation middleware for query parameters
export const validateGalleryFilters = (req, res, next) => {
  const { error, value } = galleryFiltersSchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = {};
    error.details.forEach(detail => {
      errors[detail.path.join('.')] = detail.message;
    });

    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      errors,
      timestamp: new Date().toISOString()
    });
  }

  req.query = value;
  next();
};