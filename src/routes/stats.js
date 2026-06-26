const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticate } = require('../middleware/auth');
const authorize = require('../middleware/role');

/**
 * @swagger
 * /api/v1/stats/overview:
 *   get:
 *     tags: [Stats]
 *     summary: Get overview stats (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview stats
 *       403:
 *         description: Admin only
 */
router.get('/overview', authenticate, authorize('admin'), statsController.getOverview);

/**
 * @swagger
 * /api/v1/stats/posts:
 *   get:
 *     tags: [Stats]
 *     summary: Get posts per month (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Posts chart data
 */
router.get('/posts', authenticate, authorize('admin'), statsController.getPostsStats);

/**
 * @swagger
 * /api/v1/stats/popular:
 *   get:
 *     tags: [Stats]
 *     summary: Get popular posts (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top 10 most viewed posts
 */
router.get('/popular', authenticate, authorize('admin'), statsController.getPopularPosts);

module.exports = router;
