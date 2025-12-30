const COOLDOWN_SECONDS = 60;

exports.canResend = (user, action) => {
  const nextAllowedAt = user.resendCooldowns?.[action];
  if (!nextAllowedAt) return true;
  return Date.now() >= new Date(nextAllowedAt).getTime();
};

exports.setCooldown = (user, action) => {
  const nextTime = new Date(Date.now() + COOLDOWN_SECONDS * 1000);
  user.resendCooldowns[action] = nextTime;
};
