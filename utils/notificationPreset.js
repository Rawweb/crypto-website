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
};

module.exports = notificationPresets;
