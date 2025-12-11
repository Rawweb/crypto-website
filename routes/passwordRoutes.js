const express = require('express');
const { sendPasswordReset,
    resetPassword } = require('../controllers/passwordController');

const router = express.Router();

router.post('/forgot-password', sendPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;