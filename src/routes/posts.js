const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createPostValidator, updatePostValidator } = require('../validators/postValidator');

/**
 * @swagger
 * /api/v1/posts:
 *   get:
 *     tags: [Posts]
 *     summary: Get all published posts
 *     parameters:
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
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest, oldest, popular, trending]
 *     responses:
 *       200:
 *         description: Posts list
 */
router.get('/', postController.getAllPosts);

/**
 * @swagger
 * /api/v1/posts/bookmarked:
 *   get:
 *     tags: [Posts]
 *     summary: Get bookmarked posts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bookmarked posts
 */
router.get('/bookmarked', authenticate, postController.getBookmarkedPosts);

/**
 * @swagger
 * /api/v1/posts:
 *   post:
 *     tags: [Posts]
 *     summary: Create a new post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *                 example: My First Post
 *               content:
 *                 type: string
 *                 example: This is the content of my post
 *               excerpt:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               cover_image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created
 *       400:
 *         description: Validation error
 */
router.post('/', authenticate, createPostValidator, validate, postController.createPost);

/**
 * @swagger
 * /api/v1/posts/{slug}:
 *   get:
 *     tags: [Posts]
 *     summary: Get post by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post detail
 *       404:
 *         description: Post not found
 */
router.get('/:slug', postController.getPostBySlug);

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   put:
 *     tags: [Posts]
 *     summary: Update a post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated
 *       403:
 *         description: Not authorized
 */
router.put('/:id', authenticate, updatePostValidator, validate, postController.updatePost);

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   delete:
 *     tags: [Posts]
 *     summary: Delete a post
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
 *         description: Post deleted
 *       403:
 *         description: Not authorized
 */
router.delete('/:id', authenticate, postController.deletePost);

/**
 * @swagger
 * /api/v1/posts/{id}/publish:
 *   post:
 *     tags: [Posts]
 *     summary: Publish a draft post
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
 *         description: Post published
 */
router.post('/:id/publish', authenticate, postController.publishPost);

/**
 * @swagger
 * /api/v1/posts/{id}/archive:
 *   post:
 *     tags: [Posts]
 *     summary: Archive a post
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
 *         description: Post archived
 */
router.post('/:id/archive', authenticate, postController.archivePost);

/**
 * @swagger
 * /api/v1/posts/{id}/related:
 *   get:
 *     tags: [Posts]
 *     summary: Get related posts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Related posts
 */
router.get('/:id/related', postController.getRelatedPosts);

/**
 * @swagger
 * /api/v1/posts/{id}/like:
 *   post:
 *     tags: [Posts]
 *     summary: Like a post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Post liked
 *       409:
 *         description: Already liked
 */
router.post('/:id/like', authenticate, postController.likePost);

/**
 * @swagger
 * /api/v1/posts/{id}/like:
 *   delete:
 *     tags: [Posts]
 *     summary: Unlike a post
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
 *         description: Like removed
 */
router.delete('/:id/like', authenticate, postController.unlikePost);

/**
 * @swagger
 * /api/v1/posts/{id}/likes:
 *   get:
 *     tags: [Posts]
 *     summary: Get post likes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Likes list
 */
router.get('/:id/likes', postController.getPostLikes);

/**
 * @swagger
 * /api/v1/posts/{id}/bookmark:
 *   post:
 *     tags: [Posts]
 *     summary: Bookmark a post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Post bookmarked
 */
router.post('/:id/bookmark', authenticate, postController.bookmarkPost);

/**
 * @swagger
 * /api/v1/posts/{id}/bookmark:
 *   delete:
 *     tags: [Posts]
 *     summary: Remove bookmark
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
 *         description: Bookmark removed
 */
router.delete('/:id/bookmark', authenticate, postController.unbookmarkPost);

module.exports = router;
