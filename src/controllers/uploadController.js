const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.uploadImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  const b64 = Buffer.from(req.file.buffer).toString('base64');
  const dataURI = `data:${req.file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'contentos/uploads',
    transformation: [{ width: 1200, quality: 'auto' }],
  });

  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    data: {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    },
  });
});
