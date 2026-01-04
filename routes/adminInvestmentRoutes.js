const express = require('express');
const { getAllInvestments, cancelInvestment } = require('../controllers/investmentController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, admin, getAllInvestments);
router.put('/:id/cancel', protect, admin, cancelInvestment);

module.exports = router;
