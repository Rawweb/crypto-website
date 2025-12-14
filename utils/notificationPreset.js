const notificationPresets = {
  DEPOSIT_APPROVED: {
    title: 'Deposit Approved',
    body: ({ amount }) => `
      <p>Your deposit of <b>${amount}</b> has been approved successfully.</p>
      <p>You can now use the funds to invest or withdraw.</p>
    `,
  },

  DEPOSIT_REJECTED: {
    title: 'Deposit Rejected',
    body: () => `
      <p>Your deposit request was rejected.</p>
      <p>Please contact support if you believe this was a mistake.</p>
    `,
  },

  WITHDRAWAL_APPROVED: {
    title: 'Withdrawal Approved',
    body: ({ amount }) => `
      <p>Your withdrawal request of <b>${amount}</b> has been approved.</p>
      <p>Funds will arrive in your wallet shortly.</p>
    `,
  },

  WITHDRAWAL_REJECTED: {
    title: 'Withdrawal Rejected',
    body: () => `
      <p>Your withdrawal request was rejected.</p>
      <p>Please ensure your wallet address is correct or contact support.</p>
    `,
  },

  INVESTMENT_SUCCESS: {
    title: 'Investment Successful',
    body: ({ planName, amount }) => `
      <p>You successfully invested <b>${amount}</b> in the <b>${planName}</b> plan.</p>
      <p>Your investment is now active.</p>
    `,
  },

  MAINTENANCE_NOTICE: {
    title: 'Scheduled Maintenance',
    body: ({ date }) => `
      <p>We will be performing scheduled maintenance on <b>${date}</b>.</p>
      <p>Some services may be temporarily unavailable.</p>
    `,
  },

  GENERAL_ANNOUNCEMENT: {
    title: 'Important Announcement',
    body: ({ message }) => `
      <p>${message}</p>
    `,
  },

  INVESTMENT_CREATED: {
    title: 'Investment Successful',
    body: ({ planName, amount }) => `
    <p>Your investment of <b>${amount}</b> in the <b>${planName}</b> plan was successful.</p>
    <p>You will start earning returns based on the plan schedule.</p>
  `,
  },

  ROI_CREDITED: {
    title: 'ROI Credited',
    body: ({ amount }) => `
    <p>Your return on investment of <b>${amount}</b> has been credited to your wallet.</p>
    <p>Keep growing your portfolio 🚀</p>
  `,
  },

  INVESTMENT_COMPLETED: {
    title: 'Investment Completed',
    body: ({ planName }) => `
    <p>Your investment in the <b>${planName}</b> plan has been completed.</p>
    <p>You can reinvest or withdraw your funds anytime.</p>
  `,
  },
};

module.exports = notificationPresets;
