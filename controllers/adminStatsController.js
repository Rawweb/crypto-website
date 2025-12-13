const Wallet = require('../models/walletModel');
const Deposit = require('../models/depositModel');
const Withdrawal = require('../models/withdrawalModel');
const TransactionalLog = require('../models/transactionalLogModel');
const User = require('../models/userModel');

console.log('Wallet type:', Wallet);
console.log('Wallet aggregate:', Wallet.aggregate);

// GET site balances
const getSiteBalances = async (req, res) => {
  try {
    // wallet totals
    const walletTotals = await Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: '$balance' },
          totalLockedBalance: { $sum: '$lockedBalance' },
          totalProfitBalance: { $sum: '$profitBalance' },
          totalReferralBalance: { $sum: '$referralBalance' },
        },
      },
    ]);

    const wallets = walletTotals[0] || {
      totalBalance: 0,
      totalLockedBalance: 0,
      totalProfitBalance: 0,
      totalReferralBalance: 0,
    };

    // deposits
    const approvedDeposits = await Deposit.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalDeposits = approvedDeposits[0]?.total || 0;

    // withdrawals
    const processedWithdrawals = await Withdrawal.aggregate([
      { $match: { status: 'processed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalWithdrawals = processedWithdrawals[0]?.total || 0;

    // profits paid
    const profitsPaid = await TransactionalLog.aggregate([
      { $match: { type: 'profit' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalProfitsPaid = profitsPaid[0]?.total || 0;

    // referral bonuses
    const referralBonuses = await TransactionalLog.aggregate([
      {
        $match: {
          type: 'adjustment',
          description: 'Referral Bonus earned',
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalReferralBonuses = referralBonuses[0]?.total || 0;

    // user counts
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      pendingDeposits,
      pendingWithdrawals,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'suspended' }),
      Deposit.countDocuments({ status: 'pending' }),
      Withdrawal.countDocuments({ status: 'pending' }),
    ]);

    res.json({
      wallets,
      totals: {
        totalDeposits,
        totalWithdrawals,
        totalProfitsPaid,
        totalReferralBonuses,
      },
      users: {
        totalUsers,
        activeUsers,
        suspendedUsers,
      },
      pending: {
        deposits: pendingDeposits,
        withdrawals: pendingWithdrawals,
      },
    });
  } catch (error) {
    console.error('Admin stats FULL error:', error);
    return res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
};

module.exports = {
  getSiteBalances,
};
