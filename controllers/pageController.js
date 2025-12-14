const Page = require('../models/pageModel');

/* ===== ADMIN ===== */
// create or update page
const createOrUpdatePage = async (req, res) => {
  const { slug, title, content } = req.body;

  const page = await Page.findOneAndUpdate(
    { slug },
    { title, content },
    { new: true, upsert: true }
  );

  res.json(page);
};

/* ===== PUBLIC ===== */
// get page by slug
const getPageBySlug = async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug });
  if (!page) {
    return res.status(404).json({ message: 'Page not found' });
  }
  res.json(page);
};

module.exports = {
  createOrUpdatePage,
  getPageBySlug,
};
