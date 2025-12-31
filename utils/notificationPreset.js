const notificationPresets = {
  DEPOSIT_APPROVED: {
    title: 'Deposit Approved',
    message: ({ amount }) =>
      `Your deposit of ${amount} has been approved. You can now invest or withdraw.`,
    emailBody: ({ amount }) => `
      <p>Your deposit of <b>${amount}</b> has been approved successfully.</p>
      <p>You can now use the funds to invest or withdraw.</p>
    `,
  },

  DEPOSIT_REJECTED: {
    title: 'Deposit Rejected',
    message: () =>
      'Your deposit request was rejected. Please contact support if you believe this was a mistake.',
    emailBody: () => `
      <p>Your deposit request was rejected.</p>
      <p>Please contact support if you believe this was a mistake.</p>
    `,
  },

  WITHDRAWAL_APPROVED: {
    title: 'Withdrawal Approved',
    message: ({ amount }) =>
      `Your withdrawal of ${amount} has been approved. Funds will arrive shortly.`,
    emailBody: ({ amount }) => `
      <p>Your withdrawal request of <b>${amount}</b> has been approved.</p>
      <p>Funds will arrive in your wallet shortly.</p>
    `,
  },

  WITHDRAWAL_REJECTED: {
    title: 'Withdrawal Rejected',
    message: () =>
      'Your withdrawal request was rejected. Please check your wallet address or contact support.',
    emailBody: () => `
      <p>Your withdrawal request was rejected.</p>
      <p>Please ensure your wallet address is correct or contact support.</p>
    `,
  },

  INVESTMENT_CREATED: {
    title: 'Investment Successful',
    message: ({ planName, amount }) =>
      `Your investment of ${amount} in the ${planName} plan was successful. Returns will start based on the plan schedule.`,
    emailBody: ({ planName, amount }) => `
      <p>Your investment of <b>${amount}</b> in the <b>${planName}</b> plan was successful.</p>
      <p>You will start earning returns based on the plan schedule.</p>
    `,
  },

  ROI_CREDITED: {
    title: 'ROI Credited',
    message: ({ amount }) =>
      `Your return of ${amount} has been credited to your wallet.`,
    emailBody: ({ amount }) => `
      <p>Your return on investment of <b>${amount}</b> has been credited to your wallet.</p>
      <p>Keep growing your portfolio 🚀</p>
    `,
  },

  INVESTMENT_COMPLETED: {
    title: 'Investment Completed',
    message: ({ planName }) =>
      `Your investment in the ${planName} plan has been completed. You can reinvest or withdraw anytime.`,
    emailBody: ({ planName }) => `
      <p>Your investment in the <b>${planName}</b> plan has been completed.</p>
      <p>You can reinvest or withdraw your funds anytime.</p>
    `,
  },
};

module.exports = notificationPresets;
