const { Notification } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.findAll({
    where: { user_id: req.user.id },
    order: [['created_at', 'DESC']],
    limit: 50,
  });

  const unreadCount = await Notification.count({
    where: { user_id: req.user.id, is_read: false },
  });

  res.status(200).json({
    success: true,
    data: { notifications, unread_count: unreadCount },
  });
});

exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOne({
    where: { id: req.params.id, user_id: req.user.id },
  });

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  await notification.update({ is_read: true });

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: { notification },
  });
});

exports.markAllAsRead = catchAsync(async (req, res, next) => {
  await Notification.update(
    { is_read: true },
    { where: { user_id: req.user.id, is_read: false } }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});

exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOne({
    where: { id: req.params.id, user_id: req.user.id },
  });

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  await notification.destroy();

  res.status(200).json({
    success: true,
    message: 'Notification deleted',
  });
});
