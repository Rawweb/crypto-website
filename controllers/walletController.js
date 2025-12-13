const mongoose = require('mongoose');
const Wallet = require('../models/walletModel');
const Deposit = require('../models/depositModel');
const Withdrawal = require('../models/withdrawalModel');
const TransactionalLog = require('../models/transactionalLogModel');
const User = require('../models/userModel');

const Notification = require('../models/notificationModel');
const notificationPresets = require('../utils/notificationPreset');
const { notificationEmailTemplate } = require('../utils/emailTemplate');
const sendEmail = require('../utils/sendEmail');

/* ============================
        USER FUNCTIONS
   ============================ */

// GET wallet details or auto-create wallet
const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user._id });

    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.user._id,
        balance: 0,
        profitBalance: 0,
        referralBalance: 0,
        lockedBalance: 0,
      });
    }

    return res.json(wallet);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// CREATE deposit request
const createDeposit = async (req, res) => {
  try {
    const { amount, paymentProof } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid deposit amount' });
    }

    if (!paymentProof) {
      return res.status(400).json({ message: 'Payment proof is required' });
    }

    const existing = await Deposit.findOne({
      paymentProof,
      status: { $in: ['pending', 'approved'] },
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: 'Payment proof already used in another deposit' });
    }

    const deposit = await Deposit.create({
      userId: req.user._id,
      amount,
      paymentProof,
      status: 'pending',
    });

    return res.json({
      message: 'Deposit request submitted',
      deposit,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET user deposit history
const getUserDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    return res.json(deposits);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// USER requests withdrawal
const requestWithdrawal = async (req, res) => {
  try {
    const { amount, walletAddress } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid withdrawal amount' });
    }

    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address required' });
    }

    const wallet = await Wallet.findOne({ userId: req.user._id });

    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    wallet.balance -= amount;
    wallet.lockedBalance += Number(amount);
    await wallet.save();

    const withdrawal = await Withdrawal.create({
      userId: req.user._id,
      amount,
      walletAddress,
      status: 'pending',
    });

    return res.json({
      message: 'Withdrawal request submitted',
      withdrawal,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET user withdrawal history
const getUserWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    return res.json(withdrawals);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* ============================
         ADMIN FUNCTIONS
   ============================ */

// APPROVE deposit
const approveDeposit = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { depositId } = req.body;
    session.startTransaction();

    const deposit = await Deposit.findById(depositId).session(session);
    if (!deposit || deposit.status !== 'pending') {
      throw new Error('Invalid deposit');
    }

    const wallet = await Wallet.findOne({ userId: deposit.userId }).session(
      session
    );

    if (!wallet) {
      await Wallet.create(
        [
          {
            userId: deposit.userId,
            balance: deposit.amount,
            lockedBalance: 0,
            profitBalance: 0,
            referralBalance: 0,
          },
        ],
        { session }
      );
    } else {
      wallet.balance += deposit.amount;
      await wallet.save({ session });
    }

    deposit.status = 'approved';
    await deposit.save({ session });

    await TransactionalLog.create(
      [
        {
          userId: deposit.userId,
          type: 'deposit',
          amount: deposit.amount,
          description: 'Deposit approved',
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // 🔔 AUTO NOTIFICATION (SAFE)
    try {
      const preset = notificationPresets.DEPOSIT_APPROVED;
      const user = await User.findById(deposit.userId);

      const body = preset.body({ amount: deposit.amount });
      const html = notificationEmailTemplate(
        user.username,
        preset.title,
        body
      );

      await sendEmail(user.email, preset.title, html);
      await Notification.create({
        userId: user._id,
        title: preset.title,
        message: body,
      });
    } catch (err) {
      console.error('Auto notification failed:', err);
    }

    return res.json({ message: 'Deposit approved' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// REJECT deposit
const rejectDeposit = async (req, res) => {
  try {
    const { depositId } = req.body;
    const deposit = await Deposit.findById(depositId);

    if (!deposit || deposit.status !== 'pending') {
      return res.status(400).json({ message: 'Invalid deposit' });
    }

    deposit.status = 'rejected';
    await deposit.save();

    await TransactionalLog.create({
      userId: deposit.userId,
      type: 'deposit',
      amount: deposit.amount,
      description: 'Deposit rejected',
    });

    // 🔔 AUTO NOTIFICATION (SAFE)
    try {
      const preset = notificationPresets.DEPOSIT_REJECTED;
      const user = await User.findById(deposit.userId);

      const body = preset.body({});
      const html = notificationEmailTemplate(
        user.username,
        preset.title,
        body
      );

      await sendEmail(user.email, preset.title, html);
      await Notification.create({
        userId: user._id,
        title: preset.title,
        message: body,
      });
    } catch (err) {
      console.error('Auto notification failed:', err);
    }

    return res.json({ message: 'Deposit rejected' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// APPROVE withdrawal
const approveWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { withdrawalId } = req.body;
    session.startTransaction();

    const withdrawal = await Withdrawal.findById(withdrawalId).session(session);
    if (!withdrawal || withdrawal.status !== 'pending') {
      throw new Error('Invalid withdrawal');
    }

    const wallet = await Wallet.findOne({ userId: withdrawal.userId }).session(
      session
    );

    if (!wallet || wallet.lockedBalance < withdrawal.amount) {
      throw new Error('Insufficient locked balance');
    }

    wallet.lockedBalance -= withdrawal.amount;
    await wallet.save({ session });

    withdrawal.status = 'processed';
    await withdrawal.save({ session });

    await TransactionalLog.create(
      [
        {
          userId: withdrawal.userId,
          type: 'withdrawal',
          amount: withdrawal.amount,
          description: 'Withdrawal approved',
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // 🔔 AUTO NOTIFICATION (SAFE)
    try {
      const preset = notificationPresets.WITHDRAWAL_APPROVED;
      const user = await User.findById(withdrawal.userId);

      const body = preset.body({ amount: withdrawal.amount });
      const html = notificationEmailTemplate(
        user.username,
        preset.title,
        body
      );

      await sendEmail(user.email, preset.title, html);
      await Notification.create({
        userId: user._id,
        title: preset.title,
        message: body,
      });
    } catch (err) {
      console.error('Auto notification failed:', err);
    }

    return res.json({ message: 'Withdrawal approved' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// REJECT withdrawal
const rejectWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { withdrawalId } = req.body;
    session.startTransaction();

    const withdrawal = await Withdrawal.findById(withdrawalId).session(session);
    if (!withdrawal || withdrawal.status !== 'pending') {
      throw new Error('Invalid withdrawal');
    }

    const wallet = await Wallet.findOne({ userId: withdrawal.userId }).session(
      session
    );

    wallet.lockedBalance -= withdrawal.amount;
    wallet.balance += withdrawal.amount;
    await wallet.save({ session });

    withdrawal.status = 'rejected';
    await withdrawal.save({ session });

    await TransactionalLog.create(
      [
        {
          userId: withdrawal.userId,
          type: 'withdrawal',
          amount: withdrawal.amount,
          description: 'Withdrawal rejected and refunded',
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // 🔔 AUTO NOTIFICATION (SAFE)
    try {
      const preset = notificationPresets.WITHDRAWAL_REJECTED;
      const user = await User.findById(withdrawal.userId);

      const body = preset.body({});
      const html = notificationEmailTemplate(
        user.username,
        preset.title,
        body
      );

      await sendEmail(user.email, preset.title, html);
      await Notification.create({
        userId: user._id,
        title: preset.title,
        message: body,
      });
    } catch (err) {
      console.error('Auto notification failed:', err);
    }

    return res.json({ message: 'Withdrawal rejected and refunded' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getWallet,
  createDeposit,
  getUserDeposits,
  requestWithdrawal,
  getUserWithdrawals,
  approveDeposit,
  rejectDeposit,
  approveWithdrawal,
  rejectWithdrawal,
};
