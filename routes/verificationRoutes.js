const express = require('express');
const {
  resendVerificationEmail,
  verifyEmail,
} = require('../controllers/verificationController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/send-email', protect, resendVerificationEmail);
router.post('/verify-email', verifyEmail);

module.exports = router;
