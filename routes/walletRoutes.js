const express = require('express');
const {
  getWallet,
  createDeposit,
  getUserDeposits,
  requestWithdrawal,
  getUserWithdrawals,
} = require('../controllers/walletController');
const { protect, verifiedOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, verifiedOnly, getWallet);
router.post('/deposit', protect, verifiedOnly, createDeposit);
router.get('/deposits', protect, verifiedOnly, getUserDeposits);
router.post('/withdrawal', protect, verifiedOnly, requestWithdrawal);
router.get('/withdrawals', protect, verifiedOnly, getUserWithdrawals);

module.exports = router;
