import { createClient } from 'redis';
import logger from './logger.js';

let client = null;

export const connectRedis = async () => {
  if (process.env.REDIS_ENABLED !== 'true') {
    logger.info('Redis is disabled via .env');
    return null;
  }

  const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: 0,
  };

  client = createClient({
    url: `redis://${redisConfig.password ? `:${redisConfig.password}@` : ''}${redisConfig.host}:${redisConfig.port}/${redisConfig.db}`
  });

  client.on('error', (err) => logger.error('Redis Client Error:', err));
  client.on('connect', () => logger.info('Redis Client Connected'));
  client.on('ready', () => logger.info('Redis Client Ready'));
  client.on('end', () => logger.info('Redis Client Disconnected'));

  try {
    await client.connect();
    return client;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
};

export const disconnectRedis = async () => {
  if (client && process.env.USE_REDIS === 'true') {
    try {
      await client.disconnect();
      logger.info('Redis disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting Redis:', error);
    }
  }
};

// Cache helper functions (safe fallback if redis disabled)
export const setCache = async (key, value, expiration = 3600) => {
  if (!client || process.env.USE_REDIS !== 'true') return false;
  try {
    const serializedValue = JSON.stringify(value);
    await client.setEx(key, expiration, serializedValue);
    return true;
  } catch (error) {
    logger.error('Redis SET error:', error);
    return false;
  }
};

export const getCache = async (key) => {
  if (!client || process.env.USE_REDIS !== 'true') return null;
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Redis GET error:', error);
    return null;
  }
};

export const deleteCache = async (key) => {
  if (!client || process.env.USE_REDIS !== 'true') return false;
  try {
    await client.del(key);
    return true;
  } catch (error) {
    logger.error('Redis DELETE error:', error);
    return false;
  }
};

export const deleteCachePattern = async (pattern) => {
  if (!client || process.env.USE_REDIS !== 'true') return false;
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
    return true;
  } catch (error) {
    logger.error('Redis DELETE PATTERN error:', error);
    return false;
  }
};

export default client;