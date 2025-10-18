export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  PASSWORD_CHANGED: "Password changed successfully",
  PASSWORD_RESET_SENT: "Password reset link sent to your email",
  PASSWORD_RESET_SUCCESS: "Password reset successfully",

  // User Management
  USER_CREATED: "User created successfully",
  USER_UPDATED: "User updated successfully",
  USER_DELETED: "User deleted successfully",
  USER_STATUS_UPDATED: "User status updated successfully",

  // Student Management
  STUDENT_ENROLLED: "Student enrolled successfully",
  STUDENT_UPDATED: "Student details updated successfully",
  STUDENT_DELETED: "Student deleted successfully",

  // Course Management
  COURSE_CREATED: "Course created successfully",
  COURSE_UPDATED: "Course updated successfully",
  COURSE_DELETED: "Course deleted successfully",

  // Certificate Management
  CERTIFICATE_ISSUED: "Certificate issued successfully",
  CERTIFICATE_UPDATED: "Certificate updated successfully",
  CERTIFICATE_SENT: "Certificate sent successfully",

  // Payment Management
  PAYMENT_RECORDED: "Payment recorded successfully",
  PAYMENT_UPDATED: "Payment updated successfully",
  RECEIPT_GENERATED: "Receipt generated successfully",

  // Expense Management
  EXPENSE_CREATED: "Expense recorded successfully",
  EXPENSE_UPDATED: "Expense updated successfully",
  EXPENSE_DELETED: "Expense deleted successfully",
  EXPENSE_CATEGORY_CREATED: "Expense category created successfully",
  EXPENSE_CATEGORY_UPDATED: "Expense category updated successfully",
  EXPENSE_CATEGORY_DELETED: "Expense category deleted successfully",

  // Gallery Management
  GALLERY_IMAGE_UPLOADED: "Gallery image uploaded successfully",
  GALLERY_IMAGE_UPDATED: "Gallery image updated successfully",
  GALLERY_IMAGE_DELETED: "Gallery image deleted successfully",

  ENQUIRY_CREATED: "Enquiry created successfully",
  ENQUIRY_UPDATED: "Enquiry updated successfully",
  ENQUIRY_DELETED: "Enquiry deleted successfully",
  ENQUIRY_MARKED_READ: "Enquiry marked as read",
  ENQUIRY_ACTION_TAKEN: "Action marked as taken on enquiry",

  // General
  CREATED: "Created successfully",
  UPDATED: "Updated successfully",
  DATA_RETRIEVED: "Data retrieved successfully",
  FILE_UPLOADED: "File uploaded successfully",
  EMAIL_SENT: "Email sent successfully",
  DELETED: "Deleted successfully",
  CATEGORIES_REORDERED: "Categories reordered successfully",
};

export const ERROR_MESSAGES = {
  // Authentication Errors
  INVALID_CREDENTIALS: "Invalid email or password",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  TOKEN_EXPIRED: "Token has expired",
  INVALID_TOKEN: "Invalid token",
  PASSWORD_MISMATCH: "Current password is incorrect",

  // Validation Errors
  REQUIRED_FIELDS_MISSING: "Required fields are missing",
  INVALID_EMAIL: "Invalid email format",
  INVALID_PHONE: "Invalid phone number format",
  WEAK_PASSWORD:
    "Password must be at least 8 characters long with uppercase, lowercase, number and special character",

  // User Errors
  USER_NOT_FOUND: "User not found",
  USER_ALREADY_EXISTS: "User already exists with this email",
  USER_INACTIVE: "User account is inactive",

  // Student Errors
  STUDENT_NOT_FOUND: "Student not found",
  STUDENT_ID_EXISTS: "Student ID already exists",
  STUDENT_HAS_PAYMENTS: "Cannot delete student with existing payments",

  // Course Errors
  COURSE_NOT_FOUND: "Course not found",
  COURSE_ALREADY_EXISTS: "Course already exists with this name",

  // Certificate Errors
  CERTIFICATE_NOT_FOUND: "Certificate not found",
  CERTIFICATE_NUMBER_EXISTS: "Certificate number already exists",
  INVALID_CERTIFICATE_NUMBER: "Invalid certificate number",

  // Payment Errors
  PAYMENT_NOT_FOUND: "Payment record not found",
  INSUFFICIENT_AMOUNT: "Payment amount is insufficient",

  // Expense Errors
  EXPENSE_NOT_FOUND: "Expense record not found",
  EXPENSE_CATEGORY_NOT_FOUND: "Expense category not found",
  EXPENSE_CATEGORY_IN_USE:
    "Cannot delete expense category as it has linked expenses",

  // File Upload Errors
  FILE_TOO_LARGE: "File size is too large",
  INVALID_FILE_TYPE: "Invalid file type",
  FILE_UPLOAD_FAILED: "File upload failed",

  // Database Errors
  DATABASE_ERROR: "Database error occurred",
  RECORD_NOT_FOUND: "Record not found",
  DUPLICATE_ENTRY: "Duplicate entry found",

  // General Errors
  INTERNAL_SERVER_ERROR: "Internal server error",
  BAD_REQUEST: "Bad request",
  NOT_FOUND: "Resource not found",
  VALIDATION_ERROR: "Validation error",
  NETWORK_ERROR: "Network error occurred",

  INVALID_ENQUIRY_ID: "Invalid enquiry ID provided",
  ENQUIRY_NOT_FOUND: "Enquiry not found",
  ENQUIRY_CREATE_FAILED: "Failed to create enquiry",
  ENQUIRY_UPDATE_FAILED: "Failed to update enquiry",
  ENQUIRY_DELETE_FAILED: "Failed to delete enquiry",
  SEARCH_FAILED: "Search operation failed",
  BULK_UPDATE_FAILED: "Bulk update operation failed",

  // Transaction Errors
  INVALID_TYPE: "Transaction type must be income or expense",
  INVALID_CATEGORY: "Invalid transaction category selected",
  DUPLICATE_RECEIPT: "Receipt number already exists",
  CATEGORY_NOT_FOUND: "Transaction category not found",
  CATEGORY_NAME_EXISTS: "Category name already exists",
  CATEGORY_HAS_TRANSACTIONS:
    "Cannot delete category. It has associated transactions. Please reassign or delete the transactions first.",
};
export const REVIEW_SUCCESS_MESSAGES = {
  REVIEW_CREATED: 'Review created successfully',
  REVIEW_UPDATED: 'Review updated successfully',
  REVIEW_DELETED: 'Review deleted successfully',
  REVIEW_RETRIEVED: 'Review retrieved successfully',
  REVIEWS_RETRIEVED: 'Reviews retrieved successfully',
  REVIEWS_REORDERED: 'Reviews reordered successfully',
  REVIEW_APPROVED: 'Review approved successfully',
  REVIEW_DISAPPROVED: 'Review disapproved successfully',
  STATISTICS_RETRIEVED: 'Statistics retrieved successfully'
};

// Error Messages (add to ERROR_MESSAGES object)
export const REVIEW_ERROR_MESSAGES = {
  REVIEW_NOT_FOUND: 'Review not found',
  REVIEW_ALREADY_EXISTS: 'Review already exists',
  INVALID_RATING: 'Rating must be between 1 and 5',
  INVALID_DISPLAY_ORDER: 'Display order can only be set for approved reviews',
  REVIEW_NOT_APPROVED: 'Only approved reviews can be reordered',
  INVALID_REVIEW_DATA: 'Invalid review data provided',
  REVIEW_CREATE_FAILED: 'Failed to create review',
  REVIEW_UPDATE_FAILED: 'Failed to update review',
  REVIEW_DELETE_FAILED: 'Failed to delete review'
};

// Validation Messages
export const REVIEW_VALIDATION_MESSAGES = {
  NAME_REQUIRED: 'Name is required',
  NAME_MIN_LENGTH: 'Name must be at least 2 characters',
  NAME_MAX_LENGTH: 'Name cannot exceed 100 characters',
  REVIEW_TEXT_REQUIRED: 'Review text is required',
  REVIEW_TEXT_MIN_LENGTH: 'Review text must be at least 10 characters',
  REVIEW_TEXT_MAX_LENGTH: 'Review text cannot exceed 1000 characters',
  RATING_REQUIRED: 'Rating is required',
  RATING_INVALID: 'Rating must be between 1 and 5',
  PHONE_INVALID: 'Phone number format is invalid',
  APPROVAL_STATUS_REQUIRED: 'Approval status (is_approved) is required',
  REVIEWS_ARRAY_REQUIRED: 'Reviews array is required and must not be empty',
  REVIEW_ID_REQUIRED: 'Review ID is required',
  DISPLAY_ORDER_REQUIRED: 'Display order is required'
};

export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};
export default {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  STATUS_CODES,
  REVIEW_SUCCESS_MESSAGES,
  REVIEW_ERROR_MESSAGES,
  REVIEW_VALIDATION_MESSAGES,
};
