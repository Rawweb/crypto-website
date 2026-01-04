const express = require('express');
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  getAdminNotifications,
  getUnreadAdminNotificationCount,
  markAdminAsRead,
  markAllAdminAsRead,
  deleteAdminNotification,
  clearAdminNotifications,
} = require('../controllers/adminNotificationController');

const router = express.Router();

router.get('/', protect, admin, getAdminNotifications);
router.get('/unread-count', protect, admin, getUnreadAdminNotificationCount);
router.patch('/:id/read', protect, admin, markAdminAsRead);
router.patch('/read-all', protect, admin, markAllAdminAsRead);
router.delete('/:id', protect, admin, deleteAdminNotification);
router.delete('/', protect, admin, clearAdminNotifications);

module.exports = router;
