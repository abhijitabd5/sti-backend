import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { checkRoles } from "../middlewares/roleMiddleware.js";
import CourseController from "../controllers/internal/CourseController.js";
import TransactionCategoryController from "../controllers/internal/TransactionCategoryController.js";
import TransactionController from "../controllers/internal/TransactionController.js";
import EnquiryController from "../controllers/internal/enquiryController.js";
import WebsiteEnquiryController from "../controllers/website/webEnquiryController.js";
import StudentController from "../controllers/internal/StudentController.js";
import slugify from "../utils/slugify.js";
import { generateStudentDocName } from "../utils/slugify.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

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
router.post("studentt/enroll", StudentController.createEnrollment);
router.get("/student/students", StudentController.getStudentsList);
router.get("/student/students/:studentId", StudentController.getStudentDetails);
router.put("/student/enrollments/:enrollmentId", StudentController.updateEnrollment);
router.patch("/student/students/:studentId/toggle-login", StudentController.toggleStudentLogin);
router.delete("/student/documents/:documentId", StudentController.deleteDocument);
router.get("/student/courses", StudentController.getCoursesList);


router.get("/student/:studentId/:enrollmentId/payments", StudentController.getPaymentHistory);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const studentId = req.params.studentId;
      const uploadPath = path.join(process.cwd(), "uploads", "students", studentId);
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    try {
      const studentId = req.params.studentId;
      const fileName = generateStudentDocName(studentId, file.originalname);
      cb(null, fileName);
    } catch (error) {
      cb(error);
    }
  },
});

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10, // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, PDF, DOC, and DOCX files are allowed.`),
        false
      );
    }
  },
});

// Routes
router.post(
  "/enrollment/students/:studentId/documents",
  upload.array("documents", 10),
  StudentController.uploadDocuments
);

// Gallery CRUD Routes

// Apply role-based access control for all routes
router.use(checkRoles("super_admin", "admin", "seo"));

// router.post('/', upload.single('file'), GalleryController.createGalleryItem);
// router.get('/', GalleryController.getAllGalleryItems);
// router.get('/stats', GalleryController.getGalleryStats);
// router.get('/:id', GalleryController.getGalleryItemById);
// router.put('/:id', upload.single('file'), GalleryController.updateGalleryItem);
// router.delete('/:id', GalleryController.deleteGalleryItem);
// router.patch('/:id/status', GalleryController.updateGalleryItemStatus);
// router.post('/bulk', upload.array('files', 20), GalleryController.bulkUploadGalleryItems);
// router.patch('/reorder', GalleryController.reorderGalleryItems);

export default router;
