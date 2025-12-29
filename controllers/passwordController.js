const User = require('../models/userModel');
const VerificationToken = require('../models/verificationTokenModel');
const sendEmail = require('../utils/sendEmail');
const { passwordSuccessfulTemplate } = require('../utils/emailTemplate');
const generateOTP = require('../utils/otp');
const bcrypt = require('bcryptjs');

/**
 * ================================
 * FORGOT PASSWORD (SEND OTP)
 * ================================
 */
const sendPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email not found' });
    }

    // rate limit: 1 OTP per minute
    const lastOTP = await VerificationToken.findOne({
      userId: user._id,
      purpose: 'passwordReset',
    }).sort({ createdAt: -1 });

    if (lastOTP && lastOTP.createdAt > Date.now() - 60 * 1000) {
      return res.status(429).json({
        message: 'Please wait before requesting another reset code',
      });
    }

    // clear old tokens
    await VerificationToken.deleteMany({
      userId: user._id,
      purpose: 'passwordReset',
    });

    const otp = generateOTP();

    await VerificationToken.create({
      userId: user._id,
      token: otp,
      purpose: 'passwordReset',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const subject = 'Reset Password Request';

    const html = `
<div style="background: #f5f7fb; padding: 40px;">
  <div style="
    max-width: 600px; 
    margin: auto; 
    background: #ffffff; 
    border-radius: 10px; 
    padding: 30px; 
    font-family: Arial, sans-serif;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  ">

    <!-- LOGO -->
    <div style="margin-bottom: 25px;">
      <img src="cid:logo" style="height: 45px;" alt="RawCrypto Logo" />
    </div>

    <!-- HEADER -->
    <h2 style="color: #111827; margin-bottom: 10px;">
      Password Reset Request
    </h2>

    <!-- GREETING -->
    <p style="font-size: 15px; color: #374151;">
      Hello ${user?.username || 'there'},
    </p>

    <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
      A request to reset your password has been received. Please use the OTP below
      to reset your password. This OTP is valid for the next
      <b>10 minutes</b>.
    </p>

    <!-- OTP CARD -->
    <div style="text-align: center; margin: 30px 0;">
      <div style="
        font-size: 32px;
        letter-spacing: 8px;
        padding: 18px 30px;
        background: #f0f4ff;
        border: 2px solid #2563eb;
        color: #1e3a8a;
        border-radius: 10px;
        font-weight: bold;
        display: inline-block;
      ">
        ${otp}
      </div>
    </div>

  </div>

  <!-- FOOTER -->
  <div style="text-align: center; margin-top: 15px; padding-top: 20px;">
    <p style="font-size:13px; color:#091242; font-weight:bold; margin:0;">
      RawCrypto
      <span style="color:#6c7280; font-weight:normal;">
        — Your Gateway to Secure Crypto Growth.
      </span>
    </p>

    <p style="font-size:13px; color:#6c7280; margin:6px 0 0;">
      Questions or concerns? Reach us at 
      <a href="mailto:${process.env.ADMIN_EMAIL}" 
         style="color:#091242; text-decoration:none; font-weight:bold;">
        ${process.env.ADMIN_EMAIL}
      </a>
    </p>

    <p style="font-size:13px; color:#6c7280; margin:6px 0;">
      Follow us on 
      <span style="color:#091242; font-weight:bold;">Instagram</span>, 
      <span style="color:#091242; font-weight:bold;">Facebook</span>, 
      <span style="color:#091242; font-weight:bold;">LinkedIn</span>
    </p>

    <p style="font-size:13px; color:#6c7280; margin:6px 0;">
      Don’t want more emails from us? 
      <a href="https://rawexpress.com/unsubscribe" 
         style="color:#dc2626; font-weight:bold;">
        Unsubscribe
      </a>
    </p>

    <p style="font-size:12px; color:#aaa; margin-top:18px;">
      © ${new Date().getFullYear()} RawExpress. All rights reserved.
    </p>
  </div>
</div>
    `;

    // send email
    await sendEmail(user.email, subject, html);

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * ================================
 * RESET PASSWORD (USE OTP)
 * ================================
 */
const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters long' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const record = await VerificationToken.findOne({
      userId: user._id,
      token,
      purpose: 'passwordReset',
    });

    if (!record || record.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const samePassword = await bcrypt.compare(newPassword, user.password);
    if (samePassword) {
      return res.status(400).json({
        message: 'New password must be different from the old password',
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await VerificationToken.deleteMany({ userId: user._id });

    await sendEmail(
      user.email,
      'Password Reset Successful',
      passwordSuccessfulTemplate(user.username)
    );

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * ================================
 * CHANGE PASSWORD (LOGGED IN)
 * ================================
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters long' });
    }

    const user = await User.findById(req.user._id);

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const samePassword = await bcrypt.compare(newPassword, user.password);
    if (samePassword) {
      return res.status(400).json({
        message: 'New password must be different from the old password',
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await sendEmail(
      user.email,
      'Password Changed Successfully',
      passwordSuccessfulTemplate(user.username)
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendPasswordReset,
  resetPassword,
  changePassword,
};
