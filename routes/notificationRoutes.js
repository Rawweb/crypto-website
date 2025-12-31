const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  getNotifications,
  markAsRead,
  getUnreadNotificationCount,
} = require('../controllers/notificationController');

const router = express.Router();

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadNotificationCount);
router.patch('/:id/read', protect, markAsRead);

module.exports = router;
