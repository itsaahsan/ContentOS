const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * /api/v1/upload/image:
 *   post:
 *     tags: [Upload]
 *     summary: Upload image to Cloudinary
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
 *         description: Image uploaded
 *       400:
 *         description: No file provided
 */
router.post('/image', authenticate, uploadLimiter, upload.single('image'), uploadController.uploadImage);

module.exports = router;
