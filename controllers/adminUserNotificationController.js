const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');
const { notificationEmailTemplate } = require('../utils/emailTemplate');
const Notification = require('../models/notificationModel');
const notificationPresets = require('../utils/notificationPreset');

// send email to a single user
const notifyUser = async (req, res) => {
  try {
    const { userId, presetKey, data = {} } = req.body;

    if (!userId || !presetKey) {
      return res.status(400).json({
        message: 'userId and presetKey are required',
      });
    }

    const preset = notificationPresets[presetKey];
    if (!preset) {
      return res.status(400).json({ message: 'Invalid preset key' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const subject = preset.title;
    const body = preset.body(data);
    const html = notificationEmailTemplate(user.username, subject, body);

    await sendEmail(user.email, subject, html);

    await Notification.create({
      userId,
      title: preset.title,
      message: preset.message(data),
    });

    res.json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('notifyUser error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// send email to multiple user
const notifyMultipleUsers = async (req, res) => {
  try {
    const { userIds, presetKey, data = {} } = req.body;

    if (!Array.isArray(userIds) || !presetKey) {
      return res.status(400).json({
        message: 'userIds array and presetKey are required',
      });
    }

    const preset = notificationPresets[presetKey];
    if (!preset) {
      return res.status(400).json({ message: 'Invalid preset key' });
    }

    const users = await User.find({ _id: { $in: userIds } });

    for (const user of users) {
      const subject = preset.title;
      const body = preset.body(data);
      const html = notificationEmailTemplate(user.username, subject, body);
      await sendEmail(user.email, subject, html);

      await Notification.create({
        userId,
        title: preset.title,
        message: preset.message(data),
      });
    }

    res.json({ message: 'Notifications sent successfully' });
  } catch (error) {
    console.error('notifyMultipleUsers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// broadcast email to all users
const notifyAllUsers = async (req, res) => {
  try {
    const { presetKey, data = {} } = req.body;

    const preset = notificationPresets[presetKey];
    if (!preset) {
      return res.status(400).json({ message: 'Invalid preset key' });
    }

    const users = await User.find({ status: 'active' }).select(
      'email username'
    );

    const BATCH_SIZE = 10;
    const DELAY_MS = 2000;

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async user => {
          const subject = preset.title;
          const body = preset.body(data);
          const html = notificationEmailTemplate(user.username, subject, body);

          // Send email
          await sendEmail(user.email, subject, html);

          await Notification.create({
            userId,
            title: preset.title,
            message: preset.message(data),
          });
        })
      );

      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }

    res.json({ message: 'Broadcast notification sent successfully' });
  } catch (error) {
    console.error('notifyAllUsers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  notifyUser,
  notifyMultipleUsers,
  notifyAllUsers,
};
