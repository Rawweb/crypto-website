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
router.put('/admin/draft/:id', protect, admin, updateFaqDraft);
router.put('/admin/publish/:id', protect, admin, publishFaq);
router.put('/admin/restore/:versionIndex/:id', protect, admin, restoreFaqVersion);
router.delete('/admin/delete/:id', protect, admin, deleteFaq);

// public
router.get('/', getFaqs);


module.exports = router;
