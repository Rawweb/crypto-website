const express = require('express')
const { createPlan, getAllInvestments, updatePlan, deletePlan} = require('../controllers/investmentController')
const { protect, admin } = require('../middlewares/authMiddleware')

const router = express.Router()

router.post('/create', protect, admin, createPlan)
router.get('/all', protect, admin, getAllInvestments)
router.put('/update/:planId', protect, admin, updatePlan)
router.delete('/delete/:planId', protect, admin, deletePlan)

module.exports = router