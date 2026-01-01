const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  getNotifications,
  markAsRead,
  getUnreadNotificationCount,
  markAllAsRead,
  deleteNotification,
  clearNotifications,
} = require('../controllers/notificationController');

const router = express.Router();

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadNotificationCount);
router.patch('/:id/read', protect, markAsRead);
router.patch('/read-all', protect, markAllAsRead);
router.delete('/:id', protect, deleteNotification);
router.delete('/', protect, clearNotifications);

module.exports = router;
