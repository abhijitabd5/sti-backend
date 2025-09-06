import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { checkRoles } from '../middlewares/roleMiddleware.js';
import CourseController from '../controllers/internal/CourseController.js';
import TransactionCategoryController from '../controllers/internal/TransactionCategoryController.js';
import TransactionController from '../controllers/internal/TransactionController.js';
import EnquiryController from '../controllers/internal/enquiryController.js';
import WebsiteEnquiryController from '../controllers/website/webEnquiryController.js';
import StudentEnrollmentController from '../controllers/internal/StudentEnrollmentController.js';


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

router.get('/enquiry/stats', 
  checkRoles('super_admin', 'admin', 'marketing'), 
  EnquiryController.getEnquiryStatistics
);

router.get('/enquiry/dashboard', 
  checkRoles('super_admin', 'admin', 'marketing'), 
  EnquiryController.getDashboardData
);

router.get('/enquiry/recent', 
  checkRoles('super_admin', 'admin', 'marketing', 'employee'), 
  EnquiryController.getRecentEnquiries
);

router.get('/enquiry/export', 
  checkRoles('super_admin', 'admin', 'marketing'), 
  EnquiryController.exportEnquiries
);

// Search Routes
router.get('/enquiry/search', 
  checkRoles('super_admin', 'admin', 'marketing', 'employee'), 
  EnquiryController.searchEnquiries
);

// Filter Routes
router.get('/enquiry/status/:status', 
  checkRoles('super_admin', 'admin', 'marketing', 'employee'), 
  EnquiryController.getEnquiriesByStatus
);

router.get('/enquiry/source/:source', 
  checkRoles('super_admin', 'admin', 'marketing', 'employee'), 
  EnquiryController.getEnquiriesBySource
);

// CRUD Routes
router.get('/enquiry', 
  checkRoles('super_admin', 'admin', 'marketing', 'employee'), 
  EnquiryController.getAllEnquiries
);

router.get('/enquiry/:id', 
  checkRoles('super_admin', 'admin', 'marketing', 'employee'), 
  EnquiryController.getEnquiryById
);

router.post('/enquiry', 
  checkRoles('super_admin', 'admin', 'marketing', 'employee'), 
  EnquiryController.createEnquiry
);

router.put('/enquiry/:id', 
  checkRoles('super_admin', 'admin', 'marketing', 'employee'), 
  EnquiryController.updateEnquiry
);

router.delete('/enquiry/:id', 
  checkRoles('super_admin', 'admin', 'marketing'), 
  EnquiryController.deleteEnquiry
);

// Action Routes
router.patch('/enquiry/:id/read', 
  checkRoles('super_admin', 'admin', 'marketing', 'employee'), 
  EnquiryController.markAsRead
);

router.patch('/enquiry/:id/action', 
  checkRoles('super_admin', 'admin', 'marketing', 'employee'), 
  EnquiryController.markActionTaken
);

// Bulk Operations
router.patch('/enquiry/bulk-status', 
  checkRoles('super_admin', 'admin', 'marketing'), 
  EnquiryController.bulkUpdateStatus
);

router.post('/enrollment/check-aadhar', 
  checkRoles('super_admin', 'employee', 'account'), 
  StudentEnrollmentController.checkAadharExists
);

router.post('/enroll', 
  checkRoles('admin', 'employee', 'account'), 
  StudentEnrollmentController.createEnrollment
);

router.get('/students', 
  checkRoles('admin', 'employee', 'account', 'trainer', 'warden'), 
  StudentEnrollmentController.getStudentsList
);

router.get('/students/:studentId', 
  checkRoles('admin', 'employee', 'account', 'trainer', 'warden'), 
  StudentEnrollmentController.getStudentDetails
);

router.put('/enrollments/:enrollmentId', 
  checkRoles('admin', 'employee', 'account'), 
  StudentEnrollmentController.updateEnrollment
);

router.patch('/students/:studentId/toggle-login', 
  checkRoles('admin', 'employee'), 
  StudentEnrollmentController.toggleStudentLogin
);

router.post('/students/:studentId/documents', 
  checkRoles('admin', 'employee', 'account'), 
  StudentEnrollmentController.uploadDocuments
);

router.delete('/documents/:documentId', 
  checkRoles('admin', 'employee', 'account'), 
  StudentEnrollmentController.deleteDocument
);

router.get('/courses', 
  checkRoles('admin', 'employee', 'account', 'seo'), 
  StudentEnrollmentController.getCoursesList
);


export default router;
