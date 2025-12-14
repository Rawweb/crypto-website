const Banner = require('../models/bannerModel');

/* =========================
        ADMIN
========================= */

// list all banners ( draft || published)
const getAllBannersAdmin = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const banners = await Banner.find(filter).sort({
      updatedAt: -1,
    });

    res.json(banners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// create banner draft
const createBannerDraft = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res
        .status(400)
        .json({ message: 'Title and message are required' });
    }

    const banner = await Banner.create({
      ...req.body,
      status: 'draft',
    });

    res.json({ message: 'Banner draft created', banner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// update banner draft
const updateBannerDraft = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    const { title, message, targetPage } = req.body;

    if (!title || !message) {
      return res
        .status(400)
        .json({ message: 'Title and message are required' });
    }

    if (banner.status === 'published') {
      banner.versions.push({
        title: banner.title,
        message: banner.message,
        targetPage: banner.targetPage,
        updatedAt: new Date(),
        updatedBy: req.user._id,
      });

      banner.status = 'draft';
    }

    banner.title = title;
    banner.message = message;
    banner.targetPage = targetPage ?? banner.targetPage;

    await banner.save();

    res.json({ message: 'Banner draft updated', banner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// publish banner
const publishBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    banner.status = 'published';
    banner.publishedAt = new Date();

    await banner.save();

    res.json({ message: 'Banner published', banner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// restore banner version
const restoreBannerVersion = async (req, res) => {
  try {
    const { versionIndex } = req.params;

    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    const version = banner.versions[versionIndex];
    if (!version) {
      return res.status(400).json({ message: 'Invalid version index' });
    }

    banner.title = version.title;
    banner.message = version.message;
    banner.targetPage = version.targetPage;
    banner.status = 'draft';

    await banner.save();

    res.json({ message: 'Banner version restored', banner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// delete banner
const deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Banner deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
        PUBLIC
========================= */

// get published banners
const getActiveBanners = async (req, res) => {
  try {
    const { page } = req.query;

    const filter = { status: 'published' };

    if (page && page !== 'all') {
      filter.$or = [{ targetPage: page }, { targetPage: 'all' }];
    }

    const banners = await Banner.find(filter).sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllBannersAdmin,
  createBannerDraft,
  updateBannerDraft,
  publishBanner,
  restoreBannerVersion,
  deleteBanner,
  getActiveBanners,
};
