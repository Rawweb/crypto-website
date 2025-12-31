// const nodemailer = require('nodemailer');
// const path = require('path');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    await resend.emails.send({
      from: 'RawCrypto <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    console.log('Email sent via Resend');
  } catch (error) {
    console.error('Resend email error:', error);
    throw error;
  }
};

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: Number(process.env.EMAIL_PORT),
//   secure: true,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
//   connectionTimeout: 10_000,
//   greetingTimeout: 10_000,
//   socketTimeout: 10_000,
// });

// const sendEmail = async (to, subject, html) => {
//   try {
//     const info = await transporter.sendMail({
//       from: `"RawCrypto" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html,

//       // attachments: [
//       //   {
//       //     filename: 'logo.png',
//       //     path: path.join(__dirname, '../assets/logo.png'),
//       //     cid: 'logo',
//       //   },
//       // ],
//     });

//     console.log('Email sent:', info.messageId);
//     return info;
//   } catch (err) {
//     console.error('Email error:', err);
//     throw err;
//   }
// };

module.exports = sendEmail;
