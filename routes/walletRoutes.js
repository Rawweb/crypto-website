const express = require('express');
const {
  getWallet,
  createDeposit,
  getUserDeposits,
  requestWithdrawal,
  getUserWithdrawals,
  getSavedWallets,
  updateWalletAddress,
  setDefaultWallet,
  deleteSavedWallet,
} = require('../controllers/walletController');
const uploadDepositProof = require('../middlewares/uploadDepositProof');
const uploadErrorHandler = require('../middlewares/uploadErrorHandler');
const blockIfSuspended = require('../middlewares/suspensionMiddleware');
const { protect, verifiedOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, verifiedOnly, getWallet);
router.post(
  '/deposit',
  protect,
  verifiedOnly,
  uploadDepositProof.single('proof'),
  uploadErrorHandler,
  createDeposit
);
router.get(
  '/deposits',
  protect,
  verifiedOnly,
  blockIfSuspended,
  getUserDeposits
);
router.post(
  '/withdrawal',
  protect,
  verifiedOnly,
  blockIfSuspended,
  requestWithdrawal
);
router.get(
  '/withdrawals',
  protect,
  verifiedOnly,
  blockIfSuspended,
  getUserWithdrawals
);
router.get('/saved-wallets', protect, verifiedOnly, getSavedWallets);
router.put('/update-address', protect, verifiedOnly, updateWalletAddress);
router.put('/default-wallet', protect, verifiedOnly, setDefaultWallet);
router.delete(
  '/delete-wallet',
  protect,
  verifiedOnly,
  blockIfSuspended,
  deleteSavedWallet
);

module.exports = router;
