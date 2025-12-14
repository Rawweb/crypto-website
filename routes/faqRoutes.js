const express = require ('express')
const { createFaq,
  updateFaq,
  deleteFaq,
  getFaqs, } = require('../controllers/faqController')
const { protect, admin } = require('../middlewares/authMiddleware')

const router = express.Router()

// public
router.get('/', getFaqs)

// admin
router.post('/', protect, admin, createFaq)
router.put('/:id', protect, admin, updateFaq)
router.delete('/:id', protect, admin, deleteFaq)