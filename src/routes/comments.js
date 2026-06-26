const express = require('express');
const router = express.Router({ mergeParams: true });
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');
const { createCommentValidator, updateCommentValidator } = require('../validators/commentValidator');

/**
 * @swagger
 * /api/v1/posts/{id}/comments:
 *   get:
 *     tags: [Comments]
 *     summary: Get comments for a post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comments list with nested replies
 */
router.get('/', commentController.getPostComments);

/**
 * @swagger
 * /api/v1/posts/{id}/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Create a comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 example: Great post!
 *               parent_id:
 *                 type: string
 *                 description: UUID of parent comment for replies
 *     responses:
 *       201:
 *         description: Comment created
 *       401:
 *         description: Not authenticated
 */
router.post('/', authenticate, createCommentValidator, validate, commentController.createComment);

module.exports = router;

// Standalone comment routes (mounted separately at /api/v1/comments)
const standaloneRouter = express.Router();

/**
 * @swagger
 * /api/v1/comments/{id}:
 *   put:
 *     tags: [Comments]
 *     summary: Update comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated
 *       403:
 *         description: Not your comment
 */
standaloneRouter.put('/:id', authenticate, updateCommentValidator, validate, commentController.updateComment);

/**
 * @swagger
 * /api/v1/comments/{id}:
 *   delete:
 *     tags: [Comments]
 *     summary: Delete comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 *       403:
 *         description: Not authorized
 */
standaloneRouter.delete('/:id', authenticate, commentController.deleteComment);

/**
 * @swagger
 * /api/v1/comments/{id}/like:
 *   post:
 *     tags: [Comments]
 *     summary: Like a comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment liked
 */
standaloneRouter.post('/:id/like', authenticate, commentController.likeComment);

/**
 * @swagger
 * /api/v1/comments/{id}/approve:
 *   post:
 *     tags: [Comments]
 *     summary: Approve comment (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment approved
 *       403:
 *         description: Admin only
 */
standaloneRouter.post('/:id/approve', authenticate, authorize('admin'), commentController.approveComment);

module.exports.standaloneCommentRoutes = standaloneRouter;
