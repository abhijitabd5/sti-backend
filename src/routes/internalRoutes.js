import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { checkRoles } from "../middlewares/roleMiddleware.js";
import CourseController from "../controllers/internal/CourseController.js";
import TransactionCategoryController from "../controllers/internal/TransactionCategoryController.js";
import TransactionController from "../controllers/internal/TransactionController.js";
import EnquiryController from "../controllers/internal/enquiryController.js";
import WebsiteEnquiryController from "../controllers/website/webEnquiryController.js";
import StudentController from "../controllers/internal/StudentController.js";
import PageController from "../controllers/internal/PageController.js";
import PageContentController from "../controllers/internal/PageContentController.js";
import GalleryController from "../controllers/internal/GalleryController.js";
import {uploadConfigs} from "../config/uploadConfig.js";

const router = express.Router();

// Apply authentication middleware to all internal routes
router.use(authenticate);

// Course Management Routes (roles: admin, seo)
router.use("/courses", checkRoles("super_admin", "admin", "seo"));

router.get("/courses", CourseController.getAllCourses);
router.get("/courses/:id", CourseController.getCourseById);
router.post("/courses", CourseController.createCourse);
router.put("/courses/reorder", CourseController.reorderCourses);
router.put("/courses/:id", CourseController.updateCourse);
router.patch("/courses/:id/toggle-status", CourseController.toggleCourseStatus);
router.delete("/courses/:id", CourseController.deleteCourse);

// Transaction Category routes
router.use("/transaction-categories", checkRoles("super_admin", "admin"));

router.get("/transaction-categories", TransactionCategoryController.getAllCategories);
router.get("/transaction-categories/stats", TransactionCategoryController.getCategoryStats);
router.get("/transaction-categories/:id", TransactionCategoryController.getCategoryById);
router.get("/transaction-categories/slug/:slug", TransactionCategoryController.getCategoryBySlug);
router.get("/transaction-categories/:id/usage", TransactionCategoryController.checkCategoryUsage);
router.post("/transaction-categories", TransactionCategoryController.createCategory);
router.put("/transaction-categories/:id", TransactionCategoryController.updateCategory);
router.put("/transaction-categories/reorder", TransactionCategoryController.reorderCategories);
router.delete("/transaction-categories/:id", TransactionCategoryController.deleteCategory);

// Transaction routes
router.use("/transactions", checkRoles("super_admin", "admin"));

router.get("/transactions", TransactionController.getAllTransactions);
router.get("/transactions/dashboard/stats", TransactionController.getDashboardStats);
router.get("/transactions/category/:categoryId", TransactionController.getTransactionsByCategory);
router.get("/transactions/user/:userId", TransactionController.getTransactionsByUser);
router.get("/transactions/category/:categoryId/total", TransactionController.getCategoryTransactionTotal);
router.get("/transactions/:id", TransactionController.getTransactionById);
router.post("/transactions", TransactionController.createTransaction);
router.put("/transactions/:id", TransactionController.updateTransaction);
router.delete("/transactions/:id", TransactionController.deleteTransaction);

// Enquiry Routes
router.use("/enquiry", checkRoles("super_admin", "admin"));

router.get("/enquiry/stats", EnquiryController.getEnquiryStatistics);
router.get("/enquiry/dashboard", EnquiryController.getDashboardData);
router.get("/enquiry/recent", EnquiryController.getRecentEnquiries);
router.get("/enquiry/export", EnquiryController.exportEnquiries);
router.get("/enquiry/search", EnquiryController.searchEnquiries);
router.get("/enquiry/status/:status", EnquiryController.getEnquiriesByStatus);
router.get("/enquiry/source/:source", EnquiryController.getEnquiriesBySource);
router.get("/enquiry", EnquiryController.getAllEnquiries);
router.get("/enquiry/:id", EnquiryController.getEnquiryById);
router.post("/enquiry", EnquiryController.createEnquiry);
router.put("/enquiry/:id", EnquiryController.updateEnquiry);
router.delete("/enquiry/:id", EnquiryController.deleteEnquiry);
router.patch("/enquiry/:id/read", EnquiryController.markAsRead);
router.patch("/enquiry/:id/action", EnquiryController.markActionTaken);
router.patch("/enquiry/bulk-status", EnquiryController.bulkUpdateStatus);

// All enrollment routes
router.use("/student", checkRoles("super_admin", "admin"));

router.post("/student/check-aadhar", StudentController.checkAadharExists);
router.post("/student/enroll", StudentController.createEnrollment);
router.get("/student/students", StudentController.getStudentsList);
router.get("/student/students/:studentId", StudentController.getStudentDetails);
router.put("/student/enrollments/:enrollmentId", StudentController.updateEnrollment);
router.patch("/student/students/:studentId/toggle-login", StudentController.toggleStudentLogin);
router.delete("/student/documents/:documentId", StudentController.deleteDocument);
router.get("/student/courses", StudentController.getCoursesList);


router.get("/student/:studentId/payments", StudentController.getPaymentHistory);

router.post(
  "/student/:studentId/documents",
  uploadConfigs.studentDocuments().array("documents", 10),
  StudentController.uploadDocuments
);

// Gallery CRUD Routes

router.use("/gallery",checkRoles("super_admin", "admin", "seo"));

// Updated gallery routes using uploadConfigs

const galleryUpload = uploadConfigs.galleryMedia.fields([
  { name: 'file', maxCount: 1 },        // Main media file
  { name: 'thumbnail', maxCount: 1 }    // Thumbnail for videos
]);

// Alternative: If you want to accept any field name dynamically
// const galleryUpload = uploadConfigs.galleryMedia.any();

router.post('/gallery', 
  galleryUpload,  // This is the key - specify expected fields
  GalleryController.createGalleryItem
);

// router.post('/gallery/', uploadConfigs.galleryMedia.single('file'), GalleryController.createGalleryItem);
router.post('/gallery/bulk', uploadConfigs.galleryMedia.array('files', 20), GalleryController.bulkUploadGalleryItems);
router.put('/gallery/:id', uploadConfigs.galleryMedia.single('file'), GalleryController.updateGalleryItem);

router.get('/gallery/', GalleryController.getAllGalleryItems);
router.get('/gallery/stats', GalleryController.getGalleryStats);
router.get('/gallery/:id', GalleryController.getGalleryItemById);
router.delete('/gallery/:id', GalleryController.deleteGalleryItem);
router.patch('/gallery/:id/status', GalleryController.updateGalleryItemStatus);
router.patch('/gallery/reorder', GalleryController.reorderGalleryItems);

router.use("/pages",checkRoles("super_admin", "admin", "seo"));

router.get("/pages", PageController.getAllPages);
router.post("/pages", PageController.createPage);
router.get("/pages/statistics", PageController.getPageStatistics);
router.get("/pages/language/:language", PageController.getPagesByLanguage);
router.get("/pages/slug/:slug", PageController.getPageBySlug);
router.get("/pages/:id", PageController.getPageById);
router.put("/pages/:id", PageController.updatePage);
router.delete("/pages/:id", PageController.deletePage);
router.post("/pages/:id/duplicate", PageController.duplicatePage);

router.use("/page-contents",checkRoles("super_admin", "admin", "seo"));

router.get("/page-contents", PageContentController.getAllContents);
router.post("/page-contents", PageContentController.createContent);
router.post("/page-contents/bulk", PageContentController.bulkCreateContents);
router.put("/page-contents/reorder", PageContentController.reorderContents);
router.get("/page-contents/statistics", PageContentController.getContentStatistics);

// Routes by Page ID
router.get("/page-contents/page/:pageId", PageContentController.getContentsByPage);
router.delete("/page-contents/page/:pageId", PageContentController.deleteContentsByPage);
router.get("/page-contents/page/:pageId/sections", PageContentController.getSectionKeys);
router.get("/page-contents/page/:pageId/section/:sectionKey", PageContentController.getContentsBySection);

// Routes by Content ID
router.get("/page-contents/:id", PageContentController.getContentById);
router.put("/page-contents/:id", PageContentController.updateContent);
router.delete("/page-contents/:id", PageContentController.deleteContent);
router.post("/page-contents/:id/duplicate", PageContentController.duplicateContent);

export default router;
