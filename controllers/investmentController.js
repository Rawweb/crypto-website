const mongoose = require('mongoose');
const InvestmentPlan = require('../models/investmentPlanModel');
const Investment = require('../models/investmentModel');
const Wallet = require('../models/walletModel');
const TransactionalLog = require('../models/transactionalLogModel');
const Referral = require('../models/referralModel');
const ReferralBonus = require('../models/referralBonusModel');

const Notification = require('../models/notificationModel');
const notificationPresets = require('../utils/notificationPreset');
const { notificationEmailTemplate } = require('../utils/emailTemplate');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/userModel');

/* ============================
        USER FUNCTIONS
============================ */

// GET all investment plans
const getAllPlans = async (req, res) => {
  try {
    const plans = await InvestmentPlan.find().sort({ createdAt: -1 });
    return res.json(plans);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// user invests in a plan (hardened)
const investInPlan = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { planId, amount } = req.body;

    if (!planId || !amount || amount <= 0) {
      return res
        .status(400)
        .json({ message: 'Plan and valid amount are required' });
    }

    // find plan
    const plan = await InvestmentPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // validate amount against plan rules
    if (amount < plan.minAmount || amount > plan.maxAmount) {
      return res.status(400).json({
        message: `Amount must be between ${plan.minAmount} and ${plan.maxAmount}`,
      });
    }

    // limit number of active investments per user
    const activeCount = await Investment.countDocuments({
      userId: req.user._id,
      status: 'active',
    });

    if (activeCount >= 5) {
      return res.status(400).json({
        message: 'Maximum active investments reached',
      });
    }

    session.startTransaction();

    // find wallet inside session
    const wallet = await Wallet.findOne({ userId: req.user._id }).session(
      session
    );

    if (!wallet || wallet.balance < amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // deduct wallet balance FIRST (atomic)
    wallet.balance -= amount;
    await wallet.save({ session });

    // calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationDays);

    const nextProfitTime = new Date();
    if (plan.roiType === 'daily')
      nextProfitTime.setDate(nextProfitTime.getDate() + 1);
    if (plan.roiType === 'weekly')
      nextProfitTime.setDate(nextProfitTime.getDate() + 7);
    if (plan.roiType === 'monthly')
      nextProfitTime.setMonth(nextProfitTime.getMonth() + 1);

    // create investment inside transaction
    const [investment] = await Investment.create(
      [
        {
          userId: req.user._id,
          planId,
          amount,
          startDate,
          endDate,
          nextProfitTime,
          profitEarned: 0,
          status: 'active',
        },
      ],
      { session }
    );

    // log adjustment (for audit)
    await TransactionalLog.create(
      [
        {
          userId: req.user._id,
          type: 'adjustment',
          amount,
          description: `Invested in plan: ${plan.name}`,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // referral bonus after successful investment
    const referral = await Referral.findOne({
      referredBy: req.user._id,
    });

    if (referral) {
      const REFERRAL_PERCENT = 5;

      const bonusAmount = Number(
        ((amount * REFERRAL_PERCENT) / 100).toFixed(2)
      );

      if (bonusAmount > 0) {
        const referrerWallet = await Wallet.findOne({
          userId: referral.referralId,
        });

        if (referrerWallet) {
          referrerWallet.referralBalance += bonusAmount;
          await referrerWallet.save();

          await ReferralBonus.create({
            referralId: referral.referralId,
            referredBy: req.user._id,
            investmentId: investment._id,
            amount: bonusAmount,
            level: 1,
          });

          await TransactionalLog.create({
            userId: referral.referralId,
            type: 'adjustment',
            amount: bonusAmount,
            description: 'Referral bonus earned',
          });
        }
      }
    }

    // 🔔 Auto notification: Investment created
    try {
      const preset = notificationPresets.INVESTMENT_CREATED;
      const user = await User.findById(req.user._id);

      const message = preset.message({
        planName: plan.name,
        amount: investment.amount,
      });

      const emailHtml = preset.emailBody({
        planName: plan.name,
        amount: investment.amount,
      });

      await sendEmail(
        user.email,
        preset.title,
        notificationEmailTemplate(user.username, preset.title, emailHtml)
      );

      await Notification.create({
        userId: user._id,
        title: preset.title,
        message,
      });
    } catch (err) {
      console.error('Investment created notification failed:', err);
    }

    return res.json({
      message: 'Investment successful',
      investment,
    });
  } catch (error) {
    console.log(error);
    try {
      await session.abortTransaction();
      session.endSession();
    } catch (e) {
      console.log('Error aborting transaction', e);
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

// get user investments
const getUserInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user._id })
      .populate('planId')
      .sort({ createdAt: -1 });

    return res.json(investments);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET single investment (user only)
const getSingleInvestment = async (req, res) => {
  try {
    const { id } = req.params;

    const investment = await Investment.findOne({
      _id: id,
      userId: req.user._id, // 🔒 ensures user can only access their own investment
    }).populate('planId');

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    res.json(investment);
  } catch (error) {
    console.error('Get single investment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ============================
        ADMIN FUNCTION
============================ */

// create investment plan
const createPlan = async (req, res) => {
  try {
    const {
      name,
      minAmount,
      maxAmount,
      roi,
      roiType,
      durationDays,
      maxMultiplier,
    } = req.body;

    if (roiType === 'daily' && durationDays < 1) {
      return res.status(400).json({
        message: 'Daily plans must be at least 1 day',
      });
    }

    if (roiType === 'weekly' && durationDays < 7) {
      return res.status(400).json({
        message: 'Weekly plans must be at least 7 days',
      });
    }

    if (roiType === 'monthly' && durationDays < 30) {
      return res.status(400).json({
        message: 'Monthly plans must be at least 30 days',
      });
    }

    const plan = await InvestmentPlan.create({
      name,
      minAmount,
      maxAmount,
      roi,
      roiType,
      durationDays,
      maxMultiplier: maxMultiplier || 3,
    });

    return res.json({
      message: 'Investment plan created',
      plan,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// get all investments
const getAllInvestments = async (req, res) => {
  try {
    const investments = await Investment.find()
      .populate('userId', 'email')
      .populate('planId')
      .sort({ createdAt: -1 });

    res.json(investments);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// edit plan
const updatePlan = async (req, res) => {
  try {
    const { planId } = req.params;

    const updated = await InvestmentPlan.findByIdAndUpdate(planId, req.body, {
      new: true,
    });

    return res.json({
      message: 'Plan updated',
      plan: updated,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// delete plan
const deletePlan = async (req, res) => {
  try {
    await InvestmentPlan.findByIdAndDelete(req.params.planId);
    return res.json({ message: 'Plan deleted' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* ======================================
        SYSTEM LOGIC - ROI + Auto Close
========================================= */

// generate profit (atomic + safe)
const generateProfits = async () => {
  const now = new Date();

  const investments = await Investment.find({
    status: 'active',
    nextProfitTime: { $lte: now },
  }).populate('planId');

  for (const inv of investments) {
    // skip expired
    if (inv.endDate <= now) continue;

    const roiAmount = Number(((inv.amount * inv.planId.roi) / 100).toFixed(2));
    if (roiAmount <= 0) continue;

    const maxMultiplier = inv.planId.maxMultiplier || 3;
    const maxProfit = inv.amount * maxMultiplier;
    const remainingAllowed = maxProfit - inv.profitEarned;

    if (remainingAllowed <= 0) {
      inv.status = 'completed';
      await inv.save();
      continue;
    }

    const creditedProfit = Math.min(roiAmount, remainingAllowed);

    // calculate next profit time FIRST
    const nextTime = new Date(inv.nextProfitTime);
    if (inv.planId.roiType === 'daily')
      nextTime.setDate(nextTime.getDate() + 1);
    if (inv.planId.roiType === 'weekly')
      nextTime.setDate(nextTime.getDate() + 7);
    if (inv.planId.roiType === 'monthly')
      nextTime.setMonth(nextTime.getMonth() + 1);

    // atomic claim (prevents double credit)
    const claimed = await Investment.findOneAndUpdate(
      {
        _id: inv._id,
        nextProfitTime: inv.nextProfitTime,
      },
      {
        $set: { nextProfitTime: nextTime },
        $inc: { profitEarned: creditedProfit },
      },
      { new: true }
    );

    if (!claimed) continue; // already processed elsewhere

    const wallet = await Wallet.findOne({ userId: inv.userId });
    if (!wallet) continue;

    if (inv.planId.profitDestination === 'profit') {
      wallet.profitBalance += creditedProfit;
    } else {
      wallet.balance += creditedProfit;
    }

    await wallet.save();

    await TransactionalLog.create({
      userId: inv.userId,
      investmentId: inv._id,
      type: 'profit',
      amount: creditedProfit,
      description: 'ROI credited',
    });
  }
};

// auto close completed investments + return principal
const closeCompletedInvestments = async () => {
  const now = new Date();

  const investments = await Investment.find({
    status: 'active',
    endDate: { $lte: now },
  }).populate('planId');

  for (const inv of investments) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // mark investment as completed
      inv.status = 'completed';
      await inv.save({ session });

      // credit capital back to wallet
      const wallet = await Wallet.findOne({ userId: inv.userId }).session(
        session
      );

      if (wallet) {
        wallet.balance += inv.amount;
        await wallet.save({ session });
      }

      // log capital return
      await TransactionalLog.create(
        [
          {
            userId: inv.userId,
            type: 'adjustment',
            amount: inv.amount,
            description: 'Investment capital returned',
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      // send auto notification
      try {
        const preset = notificationPresets.INVESTMENT_COMPLETED;
        const user = await User.findById(inv.userId);

        const message = preset.message({
          planName: inv.planId.name,
        });

        const emailHtml = preset.emailBody({
          planName: plan.name,
          planName: inv.planId.name,
        });

        await sendEmail(
          user.email,
          preset.title,
          notificationEmailTemplate(user.username, preset.title, emailHtml)
        );

        await Notification.create({
          userId: user._id,
          title: preset.title,
          message,
        });
      } catch (err) {
        console.error('Investment completion notification failed:', err);
      }
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error(`Failed closing investment ${inv._id}:`, err.message);
    }
  }
};

module.exports = {
  getAllPlans,
  investInPlan,
  getUserInvestments,
  getSingleInvestment,
  createPlan,
  getAllInvestments,
  updatePlan,
  deletePlan,
  generateProfits,
  closeCompletedInvestments,
};
