const express = require('express')
const { getAllPlans, investInPlan, getUserInvestments } = require('../controllers/investmentController')
const { protect, verifiedOnly } = require('../middlewares/authMiddleware')

const router = express.Router()

router.get('/plans', protect, verifiedOnly, getAllPlans)
router.post('/invest', protect, verifiedOnly, investInPlan)
router.get('/my-investments', protect, verifiedOnly, getUserInvestments)

module.exports = router