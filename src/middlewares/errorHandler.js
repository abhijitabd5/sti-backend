import logger from '../config/logger.js';
import { ERROR_MESSAGES, STATUS_CODES } from '../constants/messages.js';

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(`Error ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = ERROR_MESSAGES.RECORD_NOT_FOUND;
    error = {
      message,
      statusCode: STATUS_CODES.NOT_FOUND
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = ERROR_MESSAGES.DUPLICATE_ENTRY;
    error = {
      message,
      statusCode: STATUS_CODES.CONFLICT
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY
    };
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(e => e.message).join(', ');
    error = {
      message,
      statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY
    };
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = ERROR_MESSAGES.DUPLICATE_ENTRY;
    error = {
      message,
      statusCode: STATUS_CODES.CONFLICT
    };
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Cannot perform this operation due to existing relationships';
    error = {
      message,
      statusCode: STATUS_CODES.CONFLICT
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = ERROR_MESSAGES.INVALID_TOKEN;
    error = {
      message,
      statusCode: STATUS_CODES.UNAUTHORIZED
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = ERROR_MESSAGES.TOKEN_EXPIRED;
    error = {
      message,
      statusCode: STATUS_CODES.UNAUTHORIZED
    };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = ERROR_MESSAGES.FILE_TOO_LARGE;
    error = {
      message,
      statusCode: STATUS_CODES.BAD_REQUEST
    };
  }

  // Rate limiting errors
  if (err.statusCode === STATUS_CODES.TOO_MANY_REQUESTS) {
    const message = 'Too many requests, please try again later';
    error = {
      message,
      statusCode: STATUS_CODES.TOO_MANY_REQUESTS
    };
  }

  res.status(error.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(STATUS_CODES.NOT_FOUND);
  next(error);
};

export default {
  errorHandler,
  asyncHandler,
  notFound
};
