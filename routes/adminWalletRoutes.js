const express = require('express');
const {
  approveDeposit,
  rejectDeposit,
  approveWithdrawal,
  rejectWithdrawal,
} = require('../controllers/walletController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/deposit/approve', protect, admin, approveDeposit);
router.post('/deposit/reject', protect, admin, rejectDeposit);
router.post('/withdrawal/approve', protect, admin, approveWithdrawal);
router.post('/withdrawal/reject', protect, admin, rejectWithdrawal);

module.exports = router;
