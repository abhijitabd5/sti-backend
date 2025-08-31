import express from 'express';
import WebsiteCourseController from '../controllers/website/webCourseController.js';

const router = express.Router();

// No authentication required

// View Course Routes
router.get('/courses', WebsiteCourseController.getPublicCourses);
router.get('/courses/featured', WebsiteCourseController.getFeaturedCourses);
router.get('/courses/stats', WebsiteCourseController.getCourseStats);
router.get('/courses/:slug', WebsiteCourseController.getPublicCourseBySlug);

export default router;
