const express = require('express')
const { getAllPlans, investInPlan, getUserInvestments } = require('../controllers/investmentController')
const { protect } = require('../middlewares/authMiddleware')

const router = express.Router()

router.get('/plans', protect, getAllPlans)
router.post('/invest', protect, investInPlan)
router.get('/my-investments', protect, getUserInvestments)

module.exports = router