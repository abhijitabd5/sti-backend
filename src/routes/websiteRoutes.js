import express from 'express';
import WebsiteCourseController from '../controllers/website/WebCourseController.js';
import WebsiteGalleryController from '../controllers/website/WebGalleryController.js';
import WebsiteEnquiryController from '../controllers/website/WebEnquiryController.js';
import WebReviewController from '../controllers/website/WebReviewController.js';
import WebPageController from '../controllers/website/WebPageController.js';
import WebPageContentController from '../controllers/website/WebPageContentController.js';

const router = express.Router();

// No authentication required

// View Course Routes
router.get('/courses', WebsiteCourseController.getPublicCourses);
router.get('/courses/featured', WebsiteCourseController.getFeaturedCourses);
router.get('/courses/stats', WebsiteCourseController.getCourseStats);
router.get('/courses/view/:id', WebsiteCourseController.getPublicCourseById);
router.get('/courses/:slug', WebsiteCourseController.getPublicCourseBySlug);

//Enquiry Routes

router.post('/enquiry', WebsiteEnquiryController.submitEnquiry);
router.post('/enquiry/quick', WebsiteEnquiryController.submitQuickEnquiry);
router.post('/enquiry/course', WebsiteEnquiryController.submitCourseEnquiry);
router.get('/enquiry/:phone/status', WebsiteEnquiryController.checkEnquiryStatus);
router.get('/enquiry/stats', WebsiteEnquiryController.getPublicStats);

// Review Routes
router.get('/reviews', WebReviewController.getApprovedReviews);
router.post('/review/create', WebReviewController.createReview);
router.get('/reviews/statistics', WebReviewController.getStatistics);

export default router;
