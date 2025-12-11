const nodemailer = require('nodemailer');
const path = require('path');

console.log("SMTP HOST =", process.env.EMAIL_HOST);
console.log("SMTP USER =", process.env.EMAIL_USER);
console.log("SMTP PORT =", process.env.EMAIL_PORT);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"RawCrypto" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,

      attachments: [
        {
          filename: 'logo.png',
          path: path.join(__dirname, '../assets/logo.png'),
          cid: 'logo', 
        },
      ],
    });

    console.log('Email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('Email error:', err);
    throw err;
  }
};

module.exports = sendEmail;
