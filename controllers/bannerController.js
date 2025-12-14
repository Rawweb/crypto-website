const Banner = require('../models/bannerModel');

/* ===== ADMIN ===== */
// create banner
const createBanner = async (req, res) => {
  const banner = await Banner.create(req.body);
  res.json(banner);
};

// update banner
const updateBanner = async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(banner);
};

// delete banner
const deleteBanner = async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ message: 'Banner deleted' });
};

/* ===== PUBLIC ===== */
// get active banners
const getActiveBanners = async (req, res) => {
  const { page } = req.query;

  const filter = { isActive: true };
  if (page && page !== 'all') {
    filter.$or = [{ targetPage: page }, { targetPage: 'all' }];
  }

  const banners = await Banner.find(filter).sort({ createdAt: -1 });
  res.json(banners);
};

module.exports = {
  createBanner,
  updateBanner,
  deleteBanner,
  getActiveBanners,
};
