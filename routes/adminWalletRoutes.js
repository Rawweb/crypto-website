const express = require('express');
const {
  getPendingDeposits,
  approveDeposit,
  rejectDeposit,
  getPendingWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
} = require('../controllers/walletController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/deposits/pending', protect, admin, getPendingDeposits);
router.post('/deposits/approve', protect, admin, approveDeposit);
router.post('/deposits/reject', protect, admin, rejectDeposit);
router.get('/withdrawals/pending', protect, admin, getPendingWithdrawals);
router.post('/withdrawal/approve', protect, admin, approveWithdrawal);
router.post('/withdrawal/reject', protect, admin, rejectWithdrawal);

module.exports = router;
