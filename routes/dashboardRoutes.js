const express = require('express');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();


router.get('/user-dashboard', protect, (req, res) => {
  res.json({ message: `Welcome to your  ${req.user.username} dashboard` });
});

router.get('/admin/admin-dashboard', protect, admin, (req, res) => {
  res.json({ message: `Welcome to your ${req.user.username} dashboard` });
});


module.exports = router;