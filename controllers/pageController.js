const Page = require('../models/pageModel');

/* =========================
        ADMIN
========================= */

// list all pages (draft || published)
const getAllPagesAdmin = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { isDeleted: false };
    if (status) {
      filter.status = status;
    }

    const pages = await Page.find(filter).sort({ updatedAt: -1 });
    res.json(pages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// create or update page (SAVE DRAFT)
const saveDraftPage = async (req, res) => {
  try {
    const { slug, title, content } = req.body;

    if (!slug || !title || !content) {
      return res
        .status(400)
        .json({ message: 'Slug, title and content are required' });
    }

    let page = await Page.findOne({ slug });

    if (!page) {
      page = await Page.create({
        slug,
        title,
        content,
        status: 'draft',
      });

      return res.json({ message: 'Draft created', page });
    }

    if (page.status === 'published') {
      page.versions.push({
        title: page.title,
        content: page.content,
        updatedAt: new Date(),
        updatedBy: req.user._id,
      });

      page.status = 'draft';
    }

    page.title = title;
    page.content = content;

    await page.save();

    res.json({ message: 'Draft saved', page });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// publish page
const publishPage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    page.status = 'published';
    page.publishedAt = new Date();

    await page.save();

    res.json({ message: 'Page published', page });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// restore previous version
const restorePageVersion = async (req, res) => {
  try {
    const { versionIndex } = req.params;

    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    const version = page.versions[versionIndex];
    if (!version) {
      return res.status(400).json({ message: 'Invalid version index' });
    }

    page.title = version.title;
    page.content = version.content;
    page.status = 'draft';

    await page.save();

    res.json({ message: 'Version restored as draft', page });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// soft delete page
const deletePage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    page.isDeleted = true;
    page.deletedAt = new Date();

    await page.save();

    res.json({ message: 'Page deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
        PUBLIC
========================= */

// get published page by slug
const getPageBySlug = async (req, res) => {
  try {
    const page = await Page.findOne({
      slug: req.params.slug,
      status: 'published',
      isDeleted: false,
    });

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllPagesAdmin,
  saveDraftPage,
  publishPage,
  restorePageVersion,
  getPageBySlug,
  deletePage,
};
