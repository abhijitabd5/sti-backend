import { validationResult, body, param, query } from 'express-validator';
import { validationErrorResponse } from '../utils/responseFormatter.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    return validationErrorResponse(res, formattedErrors);
  }
  
  next();
};

// Common validation rules
export const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');

export const validatePassword = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character');

export const validatePhone = body('phone')
  .isMobilePhone('en-IN')
  .withMessage('Please provide a valid Indian phone number');

export const validateId = param('id')
  .isInt({ min: 1 })
  .withMessage('ID must be a positive integer');

export const validatePage = query('page')
  .optional()
  .isInt({ min: 1 })
  .withMessage('Page must be a positive integer');

export const validateLimit = query('limit')
  .optional()
  .isInt({ min: 1, max: 100 })
  .withMessage('Limit must be between 1 and 100');

export const validateSort = query('sort')
  .optional()
  .isIn(['asc', 'desc'])
  .withMessage('Sort must be either asc or desc');

// User validation rules
export const validateUserCreate = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  validateEmail,
  validatePassword,
  body('role')
    .isIn(['super_admin', 'admin', 'employee', 'trainer', 'warden', 'account', 'seo', 'marketing'])
    .withMessage('Invalid role specified')
];

export const validateUserUpdate = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('role')
    .optional()
    .isIn(['super_admin', 'admin', 'employee', 'trainer', 'warden', 'account', 'seo', 'marketing'])
    .withMessage('Invalid role specified')
];

// Student validation rules
export const validateStudentCreate = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  validateEmail,
  validatePhone,
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('address')
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),
  body('state')
    .isLength({ min: 2, max: 50 })
    .withMessage('State is required'),
  body('courseId')
    .isInt({ min: 1 })
    .withMessage('Valid course ID is required')
];

// Course validation rules
export const validateCourseCreate = [
  body('title')
    .isLength({ min: 2, max: 200 })
    .withMessage('Course title must be between 2 and 200 characters'),
  body('summary')
    .isLength({ min: 10, max: 500 })
    .withMessage('Course summary must be between 10 and 500 characters'),
  body('description')
    .isLength({ min: 50 })
    .withMessage('Course description must be at least 50 characters'),
  body('duration')
    .isLength({ min: 2, max: 50 })
    .withMessage('Duration is required'),
  body('fees')
    .isFloat({ min: 0 })
    .withMessage('Fees must be a positive number'),
  body('discountedFees')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discounted fees must be a positive number'),
  body('displayOrder')
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer')
];

// Payment validation rules
export const validatePaymentCreate = [
  body('studentId')
    .isInt({ min: 1 })
    .withMessage('Valid student ID is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('paymentMethod')
    .isIn(['cash', 'bank_transfer', 'cheque', 'upi', 'card', 'other'])
    .withMessage('Invalid payment method'),
  body('paymentDate')
    .isISO8601()
    .withMessage('Please provide a valid payment date')
];

// Certificate validation rules
export const validateCertificateCreate = [
  body('studentId')
    .isInt({ min: 1 })
    .withMessage('Valid student ID is required'),
  body('courseId')
    .isInt({ min: 1 })
    .withMessage('Valid course ID is required'),
  body('issueDate')
    .isISO8601()
    .withMessage('Please provide a valid issue date')
];

// Login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Student login validation
export const validateStudentLogin = [
  body('studentId')
    .notEmpty()
    .withMessage('Student ID is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export default {
  handleValidationErrors,
  validateEmail,
  validatePassword,
  validatePhone,
  validateId,
  validatePage,
  validateLimit,
  validateSort,
  validateUserCreate,
  validateUserUpdate,
  validateStudentCreate,
  validateCourseCreate,
  validatePaymentCreate,
  validateCertificateCreate,
  validateLogin,
  validateStudentLogin
};
