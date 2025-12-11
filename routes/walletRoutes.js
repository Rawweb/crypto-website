const express = require('express');
const {
    getWallet,
    createDeposit,
    getUserDeposits,
    requestWithdrawal,
    getUserWithdrawals,
} = require('../controllers/walletController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, getWallet);
router.post('/deposit', protect, createDeposit);
router.get('/deposits', protect, getUserDeposits);
router.post('/withdrawal', protect, requestWithdrawal);
router.get('/withdrawals', protect, getUserWithdrawals);

module.exports = router;
