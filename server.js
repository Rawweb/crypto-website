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
const adminNotificationRoutes = require('./routes/adminNotificationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const faqRoutes = require('./routes/faqRoutes');
const pageRoutes = require('./routes/pageRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const contactMessageRoutes = require('./routes/contactMessageRoutes');

const app = express();

//middlewares
app.use(express.json());

const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173'].filter(
  Boolean
);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.options('/*', cors(corsOptions));


//test
app.get('/', (req, res) => {
  res.send('Crypto API Is Running');
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
app.use('/api/admin/notifications', adminNotificationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/contact', contactMessageRoutes);

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
