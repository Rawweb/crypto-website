const mongoose = require('mongoose');
const Wallet = require('../models/walletModel');
const Deposit = require('../models/depositModel');
const Withdrawal = require('../models/withdrawalModel');
const TransactionalLog = require('../models/transactionalLogModel');
const SavedAddress = require('../models/savedAddressModel');
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
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: 'Invalid deposit amount',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: 'Deposit proof image is required',
      });
    }

    const { path, filename } = req.file; //

    // 1. DUPLICATE PROOF CHECK (GLOBAL)
    const existingProof = await Deposit.findOne({
      proofPublicId: filename,
    });

    if (existingProof) {
      return res.status(400).json({
        message: 'This payment proof has already been used',
      });
    }

    // 2. DEPOSIT COOLDOWN (PER USER)
    const COOLDOWN_MINUTES = 1;

    const recentDeposit = await Deposit.findOne({
      userId: req.user._id,
      createdAt: {
        $gte: new Date(Date.now() - COOLDOWN_MINUTES * 60 * 1000),
      },
      status: { $in: ['pending', 'approved'] },
    });

    if (recentDeposit) {
      return res.status(429).json({
        message: `Please wait ${COOLDOWN_MINUTES} minutes before making another deposit`,
      });
    }

    // 3. CREATE DEPOSIT
    const deposit = await Deposit.create({
      userId: req.user._id,
      amount,
      proofImage: path,
      proofPublicId: filename,
      status: 'pending',
    });

    res.json({
      message: 'Deposit submitted successfully',
      deposit,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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
    const { amount, network, walletAddress } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: 'Invalid withdrawal amount',
      });
    }

    if (!network) {
      return res.status(400).json({
        message: 'Withdrawal network is required',
      });
    }

    if (!walletAddress) {
      return res.status(400).json({
        message: 'Wallet address is required',
      });
    }

    const wallet = await Wallet.findOne({ userId: req.user._id });

    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({
        message: 'Insufficient balance',
      });
    }

    // WITHDRAWAL COOLDOWN (5 mins)
    const COOLDOWN_MINUTES = 1;

    const recentWithdrawal = await Withdrawal.findOne({
      userId: req.user._id,
      createdAt: {
        $gte: new Date(Date.now() - COOLDOWN_MINUTES * 60 * 1000),
      },
      status: 'pending',
    });

    if (recentWithdrawal) {
      return res.status(429).json({
        message: `Please wait ${COOLDOWN_MINUTES} minutes before making another withdrawal`,
      });
    }

    // lock funds
    wallet.balance -= amount;
    wallet.lockedBalance += amount;
    await wallet.save();

    const withdrawal = await Withdrawal.create({
      userId: req.user._id,
      amount,
      network,
      walletAddress,
      status: 'pending',
    });

    // save address if not already saved
    try {
      await SavedAddress.findOneAndUpdate(
        { userId: req.user._id, address: walletAddress },
        { network },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(err);
    }

    return res.json({
      message: 'Withdrawal request submitted',
      withdrawal,
    });
  } catch (error) {
    console.error(error);

    // catches schema validation errors (invalid address/network)
    if (error.message?.includes('Invalid wallet address')) {
      return res.status(400).json({ message: error.message });
    }

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

// GET saved withdrawal addresses
const getSavedWallets = async (req, res) => {
  try {
    const wallets = await SavedAddress.find({ userId: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.json(wallets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load wallets' });
  }
};

// update wallet address
const updateWalletAddress = async (req, res) => {
  const { usdtAddress } = req.body;

  if (!usdtAddress || usdtAddress.length < 20) {
    return res.status(400).json({ message: 'Invalid wallet address' });
  }

  const wallet = await Wallet.findOne({ userId: req.user._id });
  if (!wallet) {
    return res.status(404).json({ message: 'Wallet not found' });
  }

  wallet.usdtAddress = usdtAddress;
  await wallet.save();

  res.json({ message: 'Wallet address updated' });
};

// default wallet
const setDefaultWallet = async (req, res) => {
  const { id } = req.body;

  await SavedAddress.updateMany({ userId: req.user._id }, { isDefault: false });

  await SavedAddress.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    { isDefault: true }
  );

  res.json({ message: 'Default wallet updated' });
};

// DELETE saved wallet
const deleteSavedWallet = async (req, res) => {
  try {
    const { id } = req.params;

    const wallet = await SavedAddress.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // prevent deleting default wallet
    if (wallet.isDefault) {
      return res.status(400).json({
        message: 'You cannot delete your default wallet',
      });
    }

    await wallet.deleteOne();

    res.json({ message: 'Wallet deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete wallet' });
  }
};

/* ============================
         ADMIN FUNCTIONS
   ============================ */

// get pending deposits
const getPendingDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find({ status: 'pending' })
      .populate('userId', 'email username')
      .sort({ createdAt: -1 });

    res.json(deposits);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

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
      const message = preset.message({ amount: deposit.amount });
      const emailHtml = preset.emailBody({ amount: deposit.amount });

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
      const message = preset.message({ amount: deposit.amount });
      const emailHtml = preset.emailBody({ amount: deposit.amount });

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
      const message = preset.message({ amount: deposit.amount });
      const emailHtml = preset.emailBody({ amount: deposit.amount });

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
      const message = preset.message({ amount: deposit.amount });
      const emailHtml = preset.emailBody({ amount: deposit.amount });

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
  getSavedWallets,
  setDefaultWallet,
  deleteSavedWallet,
  updateWalletAddress,
  getPendingDeposits,
  approveDeposit,
  rejectDeposit,
  approveWithdrawal,
  rejectWithdrawal,
};
