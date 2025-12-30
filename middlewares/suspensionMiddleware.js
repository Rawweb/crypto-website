const blockIfSuspended = (req, res, next) => {
  if (req.user.status === 'suspended') {
    return res.status(403).json({
      message: 'Your account is temporarily suspended.',
      code: 'ACCOUNT_SUSPENDED',
    });
  }

  if (req.user.status === 'banned') {
    return res.status(403).json({
      message: 'Your account has been banned.',
      code: 'ACCOUNT_BANNED',
    });
  }

  next();
};

module.exports = blockIfSuspended;
