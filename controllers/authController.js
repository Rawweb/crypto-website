const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const referralCode = require('../utils/referralCode');
const Referral = require('../models/referralModel');
const Wallet = require('../models/walletModel');

// generate JWT
const generateToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// register user
const registerUser = async (req, res) => {
  try {
    const { username, email, password, referredBy, role } = req.body;

    // validate
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    //password length check
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters' });
    }

    // check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    // validate referral code
    let referrer = null;

    if (referredBy) {
      referrer = await User.findOne({ referralCode: referredBy });
      if (!referrer) {
        return res.status(400).json({ message: 'Invalid referral code' });
      }
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // generate referral code
    let generatedReferralCode;
    let exists = true;

    while (exists) {
      generatedReferralCode = referralCode(username);
      exists = await User.exists({ referralCode: generatedReferralCode });
    }

    //create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      referralCode: generatedReferralCode,
      referredBy: referrer ? referrer._id : null,
      role: role || 'user',
    });

    // create wallet
    await Wallet.create({
      userId: user._id,
      balance: 0,
      profitBalance: 0,
      referredBalance: 0,
    });

    // create referral relationship
    if (referrer) {
      await Referral.create({
        referralId: referrer._id,
        referredBy: user._id,
        referralCode: referrer.referralCode,
      });
    }

    // generate token
    const token = generateToken(user._id);

    //send response
    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    //validate
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    //check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // check if user is banned
    if (user.status === 'banned') {
      return res.status(403).json({ message: 'Your account is banned' });
    }

    // check if user is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account is suspended. Contact support' });
    }

    // generate token
    const token = generateToken(user._id);

    //send response
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
