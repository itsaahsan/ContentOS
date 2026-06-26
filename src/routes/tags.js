const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { authenticate } = require('../middleware/auth');
const authorize = require('../middleware/role');

/**
 * @swagger
 * /api/v1/tags:
 *   get:
 *     tags: [Tags]
 *     summary: Get all tags
 *     responses:
 *       200:
 *         description: Tags list
 */
router.get('/', tagController.getAllTags);

/**
 * @swagger
 * /api/v1/tags:
 *   post:
 *     tags: [Tags]
 *     summary: Create a tag
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: nodejs
 *     responses:
 *       201:
 *         description: Tag created
 *       409:
 *         description: Tag already exists
 */
router.post('/', authenticate, authorize('admin', 'author'), tagController.createTag);

/**
 * @swagger
 * /api/v1/tags/{slug}:
 *   get:
 *     tags: [Tags]
 *     summary: Get tag by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag detail
 *       404:
 *         description: Tag not found
 */
router.get('/:slug', tagController.getTagBySlug);

/**
 * @swagger
 * /api/v1/tags/{slug}/posts:
 *   get:
 *     tags: [Tags]
 *     summary: Get posts by tag
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag posts
 */
router.get('/:slug/posts', tagController.getTagPosts);

module.exports = router;
