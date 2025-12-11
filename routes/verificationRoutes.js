const express = require('express');
const {
  sendVerificationEmail,
  verifyEmail,
} = require('../controllers/verificationController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/send-email', protect, sendVerificationEmail);
router.post('/verify-email', verifyEmail);

module.exports = router;
