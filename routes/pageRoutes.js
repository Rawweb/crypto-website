const express = require('express');
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  createOrUpdatePage,
  getPageBySlug,
} = require('../controllers/pageController');

const router = express.Router();

// public
router.get('/:slug', getPageBySlug);

// admin
router.post('/', protect, admin, createOrUpdatePage);

module.exports = router;
