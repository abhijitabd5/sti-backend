import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { checkRoles } from '../middlewares/roleMiddleware.js';
import CourseController from '../controllers/internal/CourseController.js';
import TransactionCategoryController from '../controllers/internal/TransactionCategoryController.js';
import TransactionController from '../controllers/internal/TransactionController.js';

const router = express.Router();

// Apply authentication middleware to all internal routes
router.use(authenticate);

// Course Management Routes (roles: admin, seo)
router.use('/courses', checkRoles('super_admin', 'admin','seo'));

router.get('/courses', CourseController.getAllCourses);
router.get('/courses/:id', CourseController.getCourseById);
router.post('/courses', CourseController.createCourse);
router.put('/courses/reorder', CourseController.reorderCourses);
router.put('/courses/:id', CourseController.updateCourse);
router.patch('/courses/:id/toggle-status', CourseController.toggleCourseStatus);
router.delete('/courses/:id', CourseController.deleteCourse);

// EXpense Management Routes (roles: admin, account)
router.use('/courses', checkRoles('super_admin', 'admin','account'));

// Transaction Category routes
router.get('/transaction-categories', TransactionCategoryController.getAllCategories);
router.get('/transaction-categories/stats', TransactionCategoryController.getCategoryStats);
router.get('/transaction-categories/:id', TransactionCategoryController.getCategoryById);
router.get('/transaction-categories/slug/:slug', TransactionCategoryController.getCategoryBySlug);
router.get('/transaction-categories/:id/usage', TransactionCategoryController.checkCategoryUsage);
router.post('/transaction-categories', TransactionCategoryController.createCategory);
router.put('/transaction-categories/:id', TransactionCategoryController.updateCategory);
router.put('/transaction-categories/reorder', TransactionCategoryController.reorderCategories);
router.delete('/transaction-categories/:id', TransactionCategoryController.deleteCategory);

// Transaction routes
router.get('/transactions', TransactionController.getAllTransactions);
router.get('/transactions/dashboard/stats', TransactionController.getDashboardStats);
router.get('/transactions/category/:categoryId', TransactionController.getTransactionsByCategory);
router.get('/transactions/user/:userId', TransactionController.getTransactionsByUser);
router.get('/transactions/category/:categoryId/total', TransactionController.getCategoryTransactionTotal);
router.get('/transactions/:id', TransactionController.getTransactionById);
router.post('/transactions', TransactionController.createTransaction);
router.put('/transactions/:id', TransactionController.updateTransaction);
router.delete('/transactions/:id', TransactionController.deleteTransaction);


export default router;
