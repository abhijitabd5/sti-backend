import express from 'express';
import WebsiteCourseController from '../controllers/website/webCourseController.js';
import WebsiteEnquiryController from '../controllers/website/webEnquiryController.js';

const router = express.Router();

// No authentication required

// View Course Routes
router.get('/courses', WebsiteCourseController.getPublicCourses);
router.get('/courses/featured', WebsiteCourseController.getFeaturedCourses);
router.get('/courses/stats', WebsiteCourseController.getCourseStats);
router.get('/courses/:slug', WebsiteCourseController.getPublicCourseBySlug);

router.post('/enquiry', WebsiteEnquiryController.submitEnquiry);
router.post('/enquiry/quick', WebsiteEnquiryController.submitQuickEnquiry);
router.post('/enquiry/course', WebsiteEnquiryController.submitCourseEnquiry);

// Status Check Route (for customers)
router.get('/enquiry/:phone/status', WebsiteEnquiryController.checkEnquiryStatus);

// Public Statistics (for website display)
router.get('/enquiry/stats', WebsiteEnquiryController.getPublicStats);

export default router;
