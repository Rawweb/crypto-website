const express = require('express')
const { getAllPlans, investInPlan, getUserInvestments, getSingleInvestment } = require('../controllers/investmentController')
const { protect, verifiedOnly } = require('../middlewares/authMiddleware')

const router = express.Router()

router.get('/plans', protect, verifiedOnly, getAllPlans)
router.post('/invest', protect, verifiedOnly, investInPlan)
router.get('/my-investments', protect, verifiedOnly, getUserInvestments)
router.get('/:id', protect, verifiedOnly, getSingleInvestment);


module.exports = router