const express = require('express');
const {
  getWallet,
  createDeposit,
  getUserDeposits,
  requestWithdrawal,
  getUserWithdrawals,
  getSavedAddresses,
} = require('../controllers/walletController');
const uploadDepositProof = require('../middlewares/uploadDepositProof');
const uploadErrorHandler = require('../middlewares/uploadErrorHandler');
const { protect, verifiedOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, verifiedOnly, getWallet);
router.post('/deposit', protect, verifiedOnly, uploadDepositProof.single('proof'), uploadErrorHandler, createDeposit);
router.get('/deposits', protect, verifiedOnly, getUserDeposits);
router.post('/withdrawal', protect, verifiedOnly, requestWithdrawal);
router.get('/withdrawals', protect, verifiedOnly, getUserWithdrawals);
router.get('/saved-addresses', protect, verifiedOnly, getSavedAddresses);


module.exports = router;
