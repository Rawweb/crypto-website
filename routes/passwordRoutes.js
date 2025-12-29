const express = require('express');
const {
  sendPasswordReset,
  resetPassword,
  changePassword,
} = require('../controllers/passwordController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/forgot-password', sendPasswordReset);
router.post('/reset-password', resetPassword);
router.put('/change', protect, changePassword);

module.exports = router;
