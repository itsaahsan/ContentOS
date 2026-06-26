const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { updateProfileValidator, changePasswordValidator } = require('../validators/userValidator');

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users (Admin only)
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Users retrieved
 *       403:
 *         description: Admin only
 */
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update own profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile', authenticate, updateProfileValidator, validate, userController.updateProfile);

/**
 * @swagger
 * /api/v1/users/avatar:
 *   put:
 *     tags: [Users]
 *     summary: Upload avatar
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded
 */
router.put('/avatar', authenticate, upload.single('image'), userController.uploadAvatar);

/**
 * @swagger
 * /api/v1/users/change-password:
 *   put:
 *     tags: [Users]
 *     summary: Change password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [current_password, new_password]
 *             properties:
 *               current_password:
 *                 type: string
 *               new_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 *       401:
 *         description: Wrong current password
 */
router.put('/change-password', authenticate, changePasswordValidator, validate, userController.changePassword);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user (Admin only)
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
 *         description: User deleted
 *       403:
 *         description: Admin only
 */
router.delete('/:id', authenticate, authorize('admin'), userController.deleteUser);

/**
 * @swagger
 * /api/v1/users/{username}:
 *   get:
 *     tags: [Users]
 *     summary: Get user public profile
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile
 *       404:
 *         description: User not found
 */
router.get('/:username', userController.getUserByUsername);

/**
 * @swagger
 * /api/v1/users/{username}/posts:
 *   get:
 *     tags: [Users]
 *     summary: Get user's published posts
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User posts
 */
router.get('/:username/posts', userController.getUserPosts);

/**
 * @swagger
 * /api/v1/users/{id}/follow:
 *   post:
 *     tags: [Users]
 *     summary: Follow a user
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
 *         description: Followed successfully
 *       409:
 *         description: Already following
 */
router.post('/:id/follow', authenticate, userController.followUser);

/**
 * @swagger
 * /api/v1/users/{id}/follow:
 *   delete:
 *     tags: [Users]
 *     summary: Unfollow a user
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
 *         description: Unfollowed
 */
router.delete('/:id/follow', authenticate, userController.unfollowUser);

/**
 * @swagger
 * /api/v1/users/{id}/followers:
 *   get:
 *     tags: [Users]
 *     summary: Get user's followers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Followers list
 */
router.get('/:id/followers', userController.getFollowers);

/**
 * @swagger
 * /api/v1/users/{id}/following:
 *   get:
 *     tags: [Users]
 *     summary: Get user's following
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Following list
 */
router.get('/:id/following', userController.getFollowing);

module.exports = router;
