const express = require('express');
const { getUserTransactionLogs } = require('../controllers/transactionLogController');
const { protect, verifiedOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, verifiedOnly, getUserTransactionLogs);

module.exports = router;
