export const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

export const errorResponse = (res, message = 'Error', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};

export const validationErrorResponse = (res, errors, message = 'Validation Error') => {
  return res.status(422).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};

export const paginatedResponse = (res, data, pagination, message = 'Data retrieved successfully') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1
    },
    timestamp: new Date().toISOString()
  });
};

export const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return res.status(401).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

export const forbiddenResponse = (res, message = 'Access forbidden') => {
  return res.status(403).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

export const notFoundResponse = (res, message = 'Resource not found') => {
  return res.status(404).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

export const conflictResponse = (res, message = 'Resource already exists') => {
  return res.status(409).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

export const createResponse = (res, data, message = 'Resource created successfully') => {
  return res.status(201).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

export const noContentResponse = (res, message = 'Resource deleted successfully') => {
  return res.status(204).json({
    success: true,
    message,
    timestamp: new Date().toISOString()
  });
};

export default {
  successResponse,
  errorResponse,
  validationErrorResponse,
  paginatedResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  createResponse,
  noContentResponse
};