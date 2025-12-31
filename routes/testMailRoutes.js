const express = require('express');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

router.get('/test-email', async (req, res) => {
  try {
    await sendEmail(
      'rawfilefotography@gmail.com',
      'SMTP Test',
      '<h1>This is a test email</h1>'
    );
    res.json({ message: 'Email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Email failed', error: err.message });
  }
});

module.exports = router;
