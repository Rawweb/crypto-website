const crypto = require('crypto');

function generatedReferralCode(username) {
  const prefix = 'RAW'

  const random = crypto
    .randomBytes(3) 
    .toString('hex')
    .toUpperCase();

  return `${prefix}-${random}`;
}

module.exports = generatedReferralCode;