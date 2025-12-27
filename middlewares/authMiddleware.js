const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select('-password');

    next();
  } catch (error) {
    console.error('Token verification failed', error);
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

// middleware to check if the user is verified
const verifiedOnly = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      message: 'Please verify your email to continue',
    });
  }
  next();
};

// middleware to check if the user is an admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied - not an admin' });
  }
};

module.exports = { protect, verifiedOnly, admin };
