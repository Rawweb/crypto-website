const User = require('../models/userModel');
const Wallet = require('../models/walletModel');
const Referral = require('../models/referralModel');

// get all users
// GET users with pagination, search, filter
const getAllUsers = async (req, res) => {
  try {
    let { page = 1, limit = 20, search = '', status, verified } = req.query;

    page = Number(page);
    limit = Number(limit);

    const query = {};

    // SEARCH (username OR email)
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // FILTER by account status
    if (status) {
      query.status = status;
    }

    // FILTER by verified/unverified
    if (verified === 'true') query.isVerified = true;
    if (verified === 'false') query.isVerified = false;

    const totalUsers = await User.countDocuments(query);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      total: totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// get user by id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const wallet = await Wallet.findOne({ userId: user._id });
    const referrals = await Referral.find({ referralId: user._id });

    res.json({ user, wallet, referrals });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// update user data - name, email, role
const updateUser = async (req, res) => {
  try {
    const { username, email, role } = req.body;

    // check if new email is already taken
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail && existingEmail._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Email already taken' });
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: 'User updated successfully',
      user: updated,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// manually verify user email
const verifyUserEmail = async (req, res) => {
  try {
    // first find the user
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // if not verified, update it
    user.isVerified = true;
    await user.save();

    res.json({
      message: 'Email verified successfully - manually',
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// delete user permanently
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    await Wallet.deleteOne({ userId: user._id });

    await Promise.all([
      Referral.deleteMany({ referredBy: user._id }),
      Referral.deleteMany({ referralId: user._id }),
    ]);

    res.json({ message: 'User deleted' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// suspend user
const suspendUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'suspended' },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: 'User suspended',
      user: updated,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// unsuspened user
const unsuspendUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: 'User unsuspended',
      user: updated,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ban user
const banUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'banned' },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: 'User banned',
      user: updated,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  verifyUserEmail,
  deleteUser,
  suspendUser,
  unsuspendUser,
  banUser,
};
