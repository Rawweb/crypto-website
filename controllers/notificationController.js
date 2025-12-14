const Notification = require('../models/notificationModel');

// get user notifications
const getNotifications = async (req, res) => {
  const notifications = await Notification.find({
    userId: req.user._id,
  }).sort({ createdAt: -1 });

  res.json(notifications);
};

// get unread notification count
const getUnreadNotificationCount = async (req, res) => {
  const count = await Notification.countDocuments({
    userId: req.user._id,
    isRead: false,
  });

  res.json({ unread: count });
};

// mark as read
const markAsRead = async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true }
  );

  res.json({ message: 'Notification marked as read' });
};

module.exports = { getNotifications, markAsRead, getUnreadNotificationCount };
