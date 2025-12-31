const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');

const {
  getAllFaqsAdmin,
  createFaqDraft,
  updateFaqDraft,
  publishFaq,
  restoreFaqVersion,
  deleteFaq,
  getFaqs,
} = require('../controllers/faqController');

// admin
router.get('/admin/all', protect, admin, getAllFaqsAdmin);
router.post('/admin/draft', protect, admin, createFaqDraft);
router.put('/admin/:id/draft', protect, admin, updateFaqDraft);
router.put('/admin/:id/publish', protect, admin, publishFaq);
router.put(
  '/admin/restore/:id/:versionIndex',
  protect,
  admin,
  restoreFaqVersion
);
router.delete('/admin/:id/delete', protect, admin, deleteFaq);

// public
router.get('/', getFaqs);

module.exports = router;
