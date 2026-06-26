const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

/**
 * @swagger
 * /api/v1/search:
 *   get:
 *     tags: [Search]
 *     summary: Search posts, users, and tags
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [posts, users, tags]
 *         description: Filter by type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Query required
 */
router.get('/', searchController.search);

module.exports = router;
