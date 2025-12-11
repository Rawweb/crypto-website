const mongoose = require('mongoose');
const Wallet = require('../models/walletModel');
const Deposit = require('../models/depositModel');
const Withdrawal = require('../models/withdrawalModel');
const TransactionalLog = require('../models/transactionalLogModel');

/* ============================
        USER FUNCTIONS
============================ */

// GET wallet details or auto-create wallet
const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user._id });

    if (!wallet) {
      wallet = await Wallet.create({ userId: req.user._id });
    }

    return res.json(wallet);
  } catch (error) {
    console.log(error);
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

    const deposit = await Deposit.create({
      userId: req.user._id,
      amount,
      paymentProof: paymentProof || null,
      status: 'pending',
    });

    return res.json({
      message: 'Deposit request submitted',
      deposit,
    });
  } catch (error) {
    console.log(error);
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
    console.log(error);
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
    console.log(error);
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
    console.log(error);
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
    wallet.balance += deposit.amount;
    await wallet.save({ session });

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

    res.json({ message: 'Deposit approved' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Server error' });
  }
};
// REJECT deposit
const rejectDeposit = async (req, res) => {
  try {
    const { depositId } = req.body;

    const deposit = await Deposit.findById(depositId);
    if (!deposit) {
      return res.status(404).json({ message: 'Deposit not found' });
    }

    deposit.status = 'rejected';
    await deposit.save();

    return res.json({ message: 'Deposit rejected' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// APPROVE withdrawal
const approveWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.body;

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal is not pending' });
    }

    const wallet = await Wallet.findOne({ userId: withdrawal.userId });

    withdrawal.status = 'processed';
    await withdrawal.save();

    await TransactionalLog.create({
      userId: withdrawal.userId,
      type: 'withdrawal',
      amount: withdrawal.amount,
      description: 'Withdrawal approved',
    });

    return res.json({ message: 'Withdrawal approved' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// REJECT withdrawal
const rejectWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.body;

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    withdrawal.status = 'rejected';
    await withdrawal.save();

    return res.json({ message: 'Withdrawal rejected' });
  } catch (error) {
    console.log(error);
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
