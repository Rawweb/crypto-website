const verificationToken = require('../models/verificationTokenModel');
const User = require('../models/userModel');
const generateOTP = require('../utils/otp');
const sendEmail = require('../utils/sendEmail');
const { emailSuccesfulTemplate } = require('../utils/emailTemplate');
const { canResend, setCooldown } = require('../utils/cooldown');

const sendVerificationEmailLogic = async user => {
  if (!user || user.isVerified) return;

  // delete old tokens
  await verificationToken.deleteMany({
    userId: user._id,
    purpose: 'emailVerification',
  });

  const otp = generateOTP();

  await verificationToken.create({
    userId: user._id,
    token: otp,
    purpose: 'emailVerification',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  const subject = 'Verify Your Email';
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
        Verify Your Email
      </h2>

      <!-- GREETING -->
      <p style="font-size: 15px; color: #374151;">
        Hello ${user?.username || 'there'},
      </p>

      <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
        Thank you for signing up with <b>RawCrypto</b>.  
        To secure your account, please use the OTP below.  
        This code will expire in <b>10 minutes</b>.
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
          <span style="color:#6c7280; font-weight:normal;"> — Your Gateway to Secure Crypto Growth.</span>
        </p>

        <p style="font-size:13px; color:#6c7280; margin:6px 0 0;">
          Question or concerns? Reach us at 
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
          <a href="https://rawexpress.com/unsubscribe" style="color:#dc2626; font-weight:bold;">
            Unsubscribe
          </a>
        </p>

        <p style="font-size:12px; color:#aaa; margin-top:18px;">
          © ${new Date().getFullYear()} RawExpress. All rights reserved.
        </p>
      </div>
  </div>
`;

  await sendEmail(user.email, subject, html);
};

// send email verification
const sendVerificationEmail = async (req, res) => {
  try {
    await sendVerificationEmailLogic(req.user);
    res.json({ message: 'Verification email sent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    // find the verification token
    const record = await verificationToken.findOne({
      token,
      purpose: 'emailVerification',
    });

    // if token not found
    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // check expiration
    if (record.expiresAt.getTime() < Date.now()) {
      await verificationToken.deleteMany({ userId: record.userId });
      return res.status(400).json({ message: 'Token expired' });
    }

    // find the user
    const user = await User.findById(record.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // verify the user
    user.isVerified = true;
    await user.save();

    // delete all verification tokens for the user
    await verificationToken.deleteMany({ userId: user._id });

    await sendEmail(
      user.email,
      'Email Verified Successfully',
      emailSuccesfulTemplate(user.username)
    );

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// resend email verification
const resendVerificationEmail = async (req, res) => {
  const user = req.user;

  if (!canResend(user, 'verify_email')) {
    return res.status(429).json({
      message: 'Please wait before requesting another code.',
      nextAllowedAt: user.resendCooldowns.verify_email,
    });
  }

  sendVerificationEmailLogic(user).catch(err =>
    console.error('Resend verification email failed:', err)
  );

  setCooldown(user, 'verify_email');
  await user.save();

  res.json({
    message: 'Verification email sent',
    nextAllowedAt: user.resendCooldowns.verify_email,
  });
};

module.exports = {
  sendVerificationEmailLogic,
  sendVerificationEmail,
  verifyEmail,
  resendVerificationEmail,
};
