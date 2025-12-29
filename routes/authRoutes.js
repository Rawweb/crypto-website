const express = require('express');
const { registerUser, loginUser, updateProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/update-profile', protect, updateProfile);

module.exports = router;