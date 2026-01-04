const express = require('express');
const {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
  togglePlanStatus,
} = require('../controllers/adminInvestmentPlanController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, admin, getAllPlans);
router.post('/', protect, admin, createPlan);
router.put('/:planId', protect, admin, updatePlan);
router.put('/:planId/toggle', protect, admin, togglePlanStatus);
router.delete('/:planId', protect, admin, deletePlan);

module.exports = router;
