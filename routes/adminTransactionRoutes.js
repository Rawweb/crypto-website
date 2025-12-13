const express = require('express');
const {
  getAllTransactions,
  adjustBalance,
} = require('../controllers/adminTransactionController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, admin, getAllTransactions);
router.post('/adjust-balance', protect, admin, adjustBalance);

module.exports = router;