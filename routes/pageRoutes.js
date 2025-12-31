const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');

const {
  getAllPagesAdmin,
  saveDraftPage,
  publishPage,
  restorePageVersion,
  getPageBySlug,
  deletePage,
} = require('../controllers/pageController');

// admin
router.get('/admin/all', protect, admin, getAllPagesAdmin);
router.post('/admin/draft', protect, admin, saveDraftPage);
router.put('/admin/:id/publish', protect, admin, publishPage);
router.put(
  '/admin/restore/:id/:versionIndex',
  protect,
  admin,
  restorePageVersion
);
router.delete('/admin/:id/delete', protect, admin, deletePage);

// public
router.get('/:slug', getPageBySlug);

module.exports = router;
