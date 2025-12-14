const express = require('express');
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  createBanner,
  updateBanner,
  deleteBanner,
  getActiveBanners,
} = require('../controllers/bannerController');

const router = express.Router();

// public
router.get('/', getActiveBanners);

// admin
router.post('/', protect, admin, createBanner);
router.put('/:id', protect, admin, updateBanner);
router.delete('/:id', protect, admin, deleteBanner);

module.exports = router;
