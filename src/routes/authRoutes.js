import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import AuthController from '../controllers/auth/authController.js';

const router = express.Router();

// Public authentication routes
router.post('/login', AuthController.login);

// Protected authentication routes
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, AuthController.updateProfile);
router.put('/change-password', authenticate, AuthController.changePassword);
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.me);

export default router;
