const TransactionalLog = require('../models/transactionalLogModel');
const Wallet = require('../models/walletModel');
const User = require('../models/userModel');

//GET all transactions (paginated, filtered)
const getAllTransactions = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 20,
      userSearch = false,
      type,
      startDate,
      endDate,
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    const query = {};

    // filter by type
    if (type) {
      query.type = type; //deposit, withdrawal, profit, adjustment
    }

    // filter by date range
    if (startDate || endDate) {
      query.createdAt = {};

      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // search by username or email
    if (userSearch) {
      const users = await User.find({
        $or: [
          { username: { $regex: userSearch, $options: 'i' } },
          { email: { $regex: userSearch, $options: 'i' } },
        ],
      });

      const userIds = users.map(user => user._id);
      query.userId = { $in: userIds };
    }

    const total = await TransactionalLog.countDocuments(query);

    const transactions = await TransactionalLog.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      transactions,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// manual CREDIT/DEBIT
const adjustBalance = async (req, res) => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId || !amount) {
      return res
        .status(400)
        .json({ message: 'UserID and amount are required' });
    }

    const wallet = await Wallet.findOne({ userId });

    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    // update wallet
    wallet.balance += Number(amount);
    await wallet.save();

    // create transaction log
    await TransactionalLog.create({
      userId,
      type: 'adjustment',
      amount,
      description: description || 'Manual balance adjustment by admin',
    });

    res.json({ message: 'Balance adjusted successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  getAllTransactions,
  adjustBalance
}