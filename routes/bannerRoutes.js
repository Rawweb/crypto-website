const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');

const {
  getAllBannersAdmin,
  createBannerDraft,
  updateBannerDraft,
  publishBanner,
  restoreBannerVersion,
  deleteBanner,
  getActiveBanners,
} = require('../controllers/bannerController');

// admin
router.get('/admin/all', protect, admin, getAllBannersAdmin);
router.post('/admin/draft', protect, admin, createBannerDraft);
router.put('/admin/:id/draft', protect, admin, updateBannerDraft);
router.put('/admin/:id/publish', protect, admin, publishBanner);
router.put(
  '/admin/restore/:id/:versionIndex',
  protect,
  admin,
  restoreBannerVersion
);
router.delete('/admin/:id/delete', protect, admin, deleteBanner);

// public
router.get('/', getActiveBanners);

module.exports = router;
