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
router.put('/admin/draft/:id', protect, admin, updateBannerDraft);
router.put('/admin/publish/:id', protect, admin, publishBanner);
router.put('/admin/restore/:versionIndex/:id', protect, admin, restoreBannerVersion);
router.delete('/admin/delete/:id', protect, admin, deleteBanner);

// public
router.get('/', getActiveBanners);


module.exports = router;
