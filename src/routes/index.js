import express from 'express';
import authRoutes from './authRoutes.js';
import internalRoutes from './internalRoutes.js';
import studentRoutes from './studentRoutes.js';
import websiteRoutes from './websiteRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/internal', internalRoutes); 
router.use('/student', studentRoutes);
router.use('/public', websiteRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    timestamp: new Date().toISOString()
  });
});

export default router;
