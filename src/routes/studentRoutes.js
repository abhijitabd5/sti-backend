import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { checkRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all student routes
router.use(authenticate);

// Student routes (role: student)
router.use('/student', checkRoles('student'));
// Add student-specific routes here when needed

export default router;
