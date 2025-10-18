import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { checkRoles } from "../middlewares/roleMiddleware.js";
import CourseController from "../controllers/internal/CourseController.js";
import TransactionCategoryController from "../controllers/internal/TransactionCategoryController.js";
import TransactionController from "../controllers/internal/TransactionController.js";
import StudentController from "../controllers/internal/StudentController.js";
import EnquiryController from "../controllers/internal/EnquiryController.js";
import GalleryController from "../controllers/internal/GalleryController.js";
import PageController from "../controllers/internal/PageController.js";
import PageContentController from "../controllers/internal/PageContentController.js";
import ReviewController from '../controllers/internal/ReviewController.js';
import { uploadConfigs } from "../config/uploadConfig.js";

const router = express.Router();

// Apply authentication middleware to all internal routes
router.use(authenticate);

// Course Management Routes (roles: admin, seo)
router.use("/courses", checkRoles("super_admin", "admin", "seo"));

router.get("/courses", CourseController.getAllCourses);
router.get("/courses/view/:id", CourseController.getCourseById);

router.post(
  "/courses/create",
  uploadConfigs.courseFiles,
  CourseController.createCourse
);

router.put(
  "/courses/update/:id",
  uploadConfigs.courseFiles,
  CourseController.updateCourse
);

router.put("/courses/reorder", CourseController.reorderCourses);
router.patch("/courses/toggle-status/:id", CourseController.toggleCourseStatus);
router.get('/courses/variants/:course_group_id', CourseController.getCourseVariantsByGroupId);
router.delete("/courses/delete/:id", CourseController.deleteCourse);

// Transaction Category routes
router.use("/transaction-categories", checkRoles("super_admin", "admin"));

router.get("/transaction-categories", TransactionCategoryController.getAllCategories);
router.get("/transaction-categories/stats", TransactionCategoryController.getCategoryStats);
router.get("/transaction-categories/view/:id", TransactionCategoryController.getCategoryById);
router.get("/transaction-categories/view/slug/:slug", TransactionCategoryController.getCategoryBySlug);
router.get("/transaction-categories/usage/:id", TransactionCategoryController.checkCategoryUsage);
router.post("/transaction-categories/create", TransactionCategoryController.createCategory);
router.put("/transaction-categories/edit/:id", TransactionCategoryController.updateCategory);
router.put("/transaction-categories/reorder", TransactionCategoryController.reorderCategories);
router.delete("/transaction-categories/delete/:id", TransactionCategoryController.deleteCategory);

// Transaction routes
router.use("/transactions", checkRoles("super_admin", "admin"));

const transactionUploadMiddleware = (req, res, next) => {
  const attachmentType = req.body.attachment_type || "proof";
  
  let uploadConfig;
  switch (attachmentType) {
    case "invoice":
      uploadConfig = uploadConfigs.transactionInvoices;
      break;
    case "receipt":
      uploadConfig = uploadConfigs.transactionReceipts;
      break;
    case "proof":
    case "other":
    default:
      uploadConfig = uploadConfigs.transactionProofs;
      break;
  }
  
  return uploadConfig.single("attachment")(req, res, next);
};

router.post(
  "/transactions/create",
  transactionUploadMiddleware,
  TransactionController.createTransaction
);

router.put(
  "/transactions/edit/:id",
  transactionUploadMiddleware,
  TransactionController.updateTransaction
);

router.get("/transactions", TransactionController.getAllTransactions);
router.get("/transactions/dashboard/stats", TransactionController.getDashboardStats);
router.get("/transactions/category/:categoryId", TransactionController.getTransactionsByCategory);
router.get("/transactions/user/:userId", TransactionController.getTransactionsByUser);
router.get("/transactions/category/total/:categoryId", TransactionController.getCategoryTransactionTotal);
router.get("/transactions/view/:id", TransactionController.getTransactionById);
router.delete("/transactions/delete/:id", TransactionController.deleteTransaction);

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

router.use("/gallery", checkRoles("super_admin", "admin", "seo"));

// Updated gallery routes using uploadConfigs

const galleryUpload = uploadConfigs.galleryMedia.fields([
  { name: "file", maxCount: 1 }, // Main media file
  { name: "thumbnail", maxCount: 1 }, // Thumbnail for videos
]);

router.post(
  "/gallery",
  galleryUpload, // This is the key - specify expected fields
  GalleryController.createGalleryItem
);

router.post('/gallery/', uploadConfigs.galleryMedia.single('file'), GalleryController.createGalleryItem);
router.post("/gallery/bulk", uploadConfigs.galleryMedia.array("files", 20), GalleryController.bulkUploadGalleryItems);
router.put("/gallery/:id", uploadConfigs.galleryMedia.single("file"), GalleryController.updateGalleryItem);

router.get("/gallery/", GalleryController.getAllGalleryItems);
router.get("/gallery/stats", GalleryController.getGalleryStats);
router.get("/gallery/:id", GalleryController.getGalleryItemById);
router.delete("/gallery/:id", GalleryController.deleteGalleryItem);
router.patch("/gallery/:id/status", GalleryController.updateGalleryItemStatus);
router.patch("/gallery/reorder", GalleryController.reorderGalleryItems);

router.use("/pages", checkRoles("super_admin", "admin", "seo"));

router.get("/pages", PageController.getAllPages);
router.post("/pages", PageController.createPage);
router.get("/pages/statistics", PageController.getPageStatistics);
router.get("/pages/language/:language", PageController.getPagesByLanguage);
router.get("/pages/slug/:slug", PageController.getPageBySlug);
router.get("/pages/:id", PageController.getPageById);
router.put("/pages/:id", PageController.updatePage);
router.delete("/pages/:id", PageController.deletePage);
router.post("/pages/:id/duplicate", PageController.duplicatePage);

router.use("/page-contents", checkRoles("super_admin", "admin", "seo"));

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

//Review Routes

router.use('/review', checkRoles('super_admin', 'admin', 'employee', 'marketing', 'seo'));

router.get('/review/statistics', ReviewController.getStatistics);

router.post('/review/reorder', ReviewController.reorderReviews);

router.patch('/review/approval-status/:id', ReviewController.changeApprovalStatus);

router.post('/review/create', ReviewController.createReview);
router.get('/review', ReviewController.getAllReviews);
router.get('/review/view/:id', ReviewController.getReviewById);
router.put('/review/edit/:id', ReviewController.updateReview);
router.delete('/review/delete/:id', ReviewController.deleteReview);

export default router;
