const AdminNotification = require('../models/adminNotificationModel');

/* =========================
   ADMIN NOTIFICATIONS
========================= */

// GET all admin notifications
const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await AdminNotification.find().sort({
      createdAt: -1,
    });

    res.json(notifications);
  } catch (err) {
    console.error('Get admin notifications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET unread count
const getUnreadAdminNotificationCount = async (req, res) => {
  try {
    const count = await AdminNotification.countDocuments({
      isRead: false,
    });

    res.json({ unread: count });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// MARK one as read
const markAdminAsRead = async (req, res) => {
  try {
    await AdminNotification.findByIdAndUpdate(req.params.id, {
      isRead: true,
    });

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// MARK all as read
const markAllAdminAsRead = async (req, res) => {
  try {
    await AdminNotification.updateMany({}, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE one
const deleteAdminNotification = async (req, res) => {
  try {
    await AdminNotification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// CLEAR all
const clearAdminNotifications = async (req, res) => {
  try {
    await AdminNotification.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAdminNotifications,
  getUnreadAdminNotificationCount,
  markAdminAsRead,
  markAllAdminAsRead,
  deleteAdminNotification,
  clearAdminNotifications,
};
