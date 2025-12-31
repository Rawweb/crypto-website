const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const referralCode = require('../utils/referralCode');
const Referral = require('../models/referralModel');
const Wallet = require('../models/walletModel');
const { sendVerificationEmailLogic } = require('./verificationController');

// generate JWT
const generateAccessToken = user =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

const generateRefreshToken = user =>
  jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

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
      return res
        .status(400)
        .json({ message: 'User with this email or username already exists' });
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
      referralBalance: 0,
    });

    // create referral relationship
    if (referrer) {
      await Referral.create({
        referralId: referrer._id,
        referredBy: user._id,
        referralCode: referrer.referralCode,
      });
    }

    // send verification email
    await sendVerificationEmailLogic(user);

    // generate token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    //send response
    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        role: user.role,
        isVerified: user.isVerified,
      },
      token: accessToken,
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

    if (!user.isVerified) {
      await sendVerificationEmailLogic(user);
    }

    // generate token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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
        isVerified: user.isVerified,
      },
      token: accessToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// refresh token
const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({ message: 'No refresh token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const newAccessToken = generateAccessToken(user);

    res.json({
      token: newAccessToken,
      user,
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'username',
      'gender',
      'phone',
      'address',
      'avatar',
      'country',
    ];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: false, // 👈 THIS IS KEY
    }).select('-password');

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);

    return res.status(500).json({
      success: false,
      message: 'Profile update failed',
    });
  }
};

// @desc   Get current logged in user
// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

// @desc   Logout user (clear refresh token cookie)
// @route  POST /api/auth/logout
// @access Private (or Public – cookie based)
const logoutUser = async (req, res) => {
  try {
    // res.cookie('refreshToken', refreshToken, {
    //   httpOnly: true,
    //   secure: false, // localhost
    //   sameSite: 'lax', // ✅ allow same-site navigation
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      secure: true,
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  updateProfile,
  getMe,
  logoutUser,
};
