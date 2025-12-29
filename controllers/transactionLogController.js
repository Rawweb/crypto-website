const TransactionalLog = require('../models/transactionalLogModel');

// GET user transaction logs
const getUserTransactionLogs = async (req, res) => {
  try {
    const logs = await TransactionalLog.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    console.error('Get transaction logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUserTransactionLogs };
