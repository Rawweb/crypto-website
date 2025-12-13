const express = require('express')
const { getSiteBalances } = require('../controllers/adminStatsController')
const { protect, admin } = require('../middlewares/authMiddleware')

const router = express.Router()

router.get('/balances', protect, admin, getSiteBalances)

module.exports = router