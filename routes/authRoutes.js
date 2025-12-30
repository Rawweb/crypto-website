const express = require('express');
const { registerUser, loginUser, updateProfile, refreshToken, getMe, logoutUser } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/update-profile', protect, updateProfile);
router.get('/me', protect, getMe);
router.post('/refresh', refreshToken);
router.post('/logout',  logoutUser);

module.exports = router;