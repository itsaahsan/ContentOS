const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');
const authorize = require('../middleware/role');

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories
 *     responses:
 *       200:
 *         description: Categories list
 */
router.get('/', categoryController.getAllCategories);

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create category (Admin only)
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
 *                 example: Technology
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *                 example: "#6366F1"
 *               icon:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 *       403:
 *         description: Admin only
 */
router.post('/', authenticate, authorize('admin'), categoryController.createCategory);

/**
 * @swagger
 * /api/v1/categories/{slug}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category detail
 *       404:
 *         description: Category not found
 */
router.get('/:slug', categoryController.getCategoryBySlug);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update category (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 */
router.put('/:id', authenticate, authorize('admin'), categoryController.updateCategory);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category deleted
 */
router.delete('/:id', authenticate, authorize('admin'), categoryController.deleteCategory);

/**
 * @swagger
 * /api/v1/categories/{slug}/posts:
 *   get:
 *     tags: [Categories]
 *     summary: Get posts in category
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category posts
 */
router.get('/:slug/posts', categoryController.getCategoryPosts);

module.exports = router;
