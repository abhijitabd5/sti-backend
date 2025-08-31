import jwt from 'jsonwebtoken';
import { ERROR_MESSAGES } from '../constants/messages.js';

export const generateToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN || '7d') => {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn,
      issuer: 'earth-movers-academy',
      audience: 'earth-movers-users'
    });
  } catch (error) {
    throw new Error('Token generation failed');
  }
};

export const generateRefreshToken = (payload) => {
  try {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { 
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
      issuer: 'earth-movers-academy',
      audience: 'earth-movers-users'
    });
  } catch (error) {
    throw new Error('Refresh token generation failed');
  }
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'earth-movers-academy',
      audience: 'earth-movers-users'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error(ERROR_MESSAGES.TOKEN_EXPIRED);
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
    }
    throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: 'earth-movers-academy',
      audience: 'earth-movers-users'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error(ERROR_MESSAGES.TOKEN_EXPIRED);
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
    }
    throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
  }
};

export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

export const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded ? new Date(decoded.exp * 1000) : null;
  } catch (error) {
    return null;
  }
};

export const isTokenExpired = (token) => {
  try {
    const expiration = getTokenExpiration(token);
    return expiration ? new Date() > expiration : true;
  } catch (error) {
    return true;
  }
};

export default {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
  getTokenExpiration,
  isTokenExpired
};
