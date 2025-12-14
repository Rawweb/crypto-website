const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// load env vars
dotenv.config();

// connect to database
connectDB();

// cron job
require('./cron/investmentCron');

// API route files
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const walletRoutes = require('./routes/walletRoutes');
const adminWalletRoutes = require('./routes/adminWalletRoutes');
const investMentRoutes = require('./routes/investmentRoutes');
const adminInvestmentRoutes = require('./routes/adminInvestmentRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const adminTransactionLogRoutes = require('./routes/adminTransactionRoutes');
const adminStatsRoutes = require('./routes/adminStatsRoutes');
const adminNotificationRoues = require('./routes/adminNotificationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const faqRoutes = require('./routes/faqRoutes');
const pageRoutes = require('./routes/pageRoutes');
const bannerRoutes = require('./routes/bannerRoutes');

const app = express();

//middlewares
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// test route
app.get('/', (req, res) => {
  res.send('Crypto investment API is running');
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin/wallet', adminWalletRoutes);
app.use('/api/investments', investMentRoutes);
app.use('/api/admin/investments', adminInvestmentRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/transactions', adminTransactionLogRoutes);
app.use('/api/admin/stats', adminStatsRoutes);
app.use('/api/admin/notifications', adminNotificationRoues);
app.use('/api/notifications', notificationRoutes);

app.use('/api/pages', pageRoutes);
app.use('/api/banners', bannerRoutes);

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
