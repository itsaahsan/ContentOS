const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications list
 */
router.get('/', authenticate, notificationController.getNotifications);

/**
 * @swagger
 * /api/v1/notifications/read-all:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All marked as read
 */
router.put('/read-all', authenticate, notificationController.markAllAsRead);

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark notification as read
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
 *         description: Marked as read
 *       404:
 *         description: Not found
 */
router.put('/:id/read', authenticate, notificationController.markAsRead);

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete notification
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
 *         description: Notification deleted
 */
router.delete('/:id', authenticate, notificationController.deleteNotification);

module.exports = router;
