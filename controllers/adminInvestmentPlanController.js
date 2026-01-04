const InvestmentPlan = require('../models/investmentPlanModel');

/* =========================
   ADMIN – INVESTMENT PLANS
========================= */

// GET all plans
const getAllPlans = async (req, res) => {
  try {
    const plans = await InvestmentPlan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// CREATE plan
const createPlan = async (req, res) => {
  try {
    const {
      name,
      minAmount,
      maxAmount,
      roi,
      roiType,
      durationDays,
      maxMultiplier = 3,
    } = req.body;

    const plan = await InvestmentPlan.create({
      name,
      minAmount,
      maxAmount,
      roi,
      roiType,
      durationDays,
      maxMultiplier,
    });

    res.json({ message: 'Plan created', plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE plan
const updatePlan = async (req, res) => {
  try {
    const {
      name,
      minAmount,
      maxAmount,
      roi,
      roiType,
      durationDays,
      maxMultiplier,
      profitDestination,
    } = req.body;

    const updated = await InvestmentPlan.findByIdAndUpdate(
      req.params.planId,
      {
        name,
        minAmount,
        maxAmount,
        roi,
        roiType,
        durationDays,
        maxMultiplier,
        profitDestination,
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json({ message: 'Plan updated', plan: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE plan
const deletePlan = async (req, res) => {
  const hasInvestments = await Investment.exists({
    planId: req.params.planId,
  });

  if (hasInvestments) {
    return res.status(400).json({
      message: 'Cannot delete a plan with existing investments',
    });
  }

  await InvestmentPlan.findByIdAndDelete(req.params.planId);
  res.json({ message: 'Plan deleted' });
};


const togglePlanStatus = async (req, res) => {
  try {
    const plan = await InvestmentPlan.findById(req.params.planId);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    plan.isActive = !plan.isActive;
    await plan.save();

    res.json({
      message: `Plan ${plan.isActive ? 'enabled' : 'disabled'}`,
      plan,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
  togglePlanStatus,
};
