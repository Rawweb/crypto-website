const cron = require('node-cron');
const {
  generateProfits,
  closeCompletedInvestments,
} = require('../controllers/investmentController');

// runs every minute - safe for testing
cron.schedule('* * * * *', async () => {
  // system pause check
  if (process.env.SYSTEM_PAUSED === 'true') {
    console.log('⏸️ Investment system is paused');
    return;
  }

  console.log('Running investment cron...');
  await generateProfits();
  await closeCompletedInvestments();
});;
