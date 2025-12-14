const Faq = require('../models/faqModel');

/* =========================
        ADMIN
========================= */

// list all FAQs (draft || published)
const getAllFaqsAdmin = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const faqs = await Faq.find(filter).sort({
      updatedAt: -1,
      order: 1,
    });

    res.json(faqs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// create FAQ draft
const createFaqDraft = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res
        .status(400)
        .json({ message: 'Question and answer are required' });
    }

    const faq = await Faq.create({
      ...req.body,
      status: 'draft',
    });

    res.json({ message: 'FAQ draft created', faq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// update FAQ draft
const updateFaqDraft = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    const { question, answer, order } = req.body;

    if (!question || !answer) {
      return res
        .status(400)
        .json({ message: 'Question and answer are required' });
    }

    if (faq.status === 'published') {
      faq.versions.push({
        question: faq.question,
        answer: faq.answer,
        updatedAt: new Date(),
        updatedBy: req.user._id,
      });

      faq.status = 'draft';
    }

    faq.question = question;
    faq.answer = answer;
    faq.order = order ?? faq.order;

    await faq.save();

    res.json({ message: 'FAQ draft updated', faq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// publish FAQ
const publishFaq = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    faq.status = 'published';
    faq.publishedAt = new Date();

    await faq.save();

    res.json({ message: 'FAQ published', faq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// restore FAQ version
const restoreFaqVersion = async (req, res) => {
  try {
    const { versionIndex } = req.params;

    const faq = await Faq.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    const version = faq.versions[versionIndex];
    if (!version) {
      return res.status(400).json({ message: 'Invalid version index' });
    }

    faq.question = version.question;
    faq.answer = version.answer;
    faq.status = 'draft';

    await faq.save();

    res.json({ message: 'FAQ version restored', faq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// delete FAQ
const deleteFaq = async (req, res) => {
  try {
    await Faq.findByIdAndDelete(req.params.id);
    res.json({ message: 'FAQ deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
        PUBLIC
========================= */

// get published FAQs
const getFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find({ status: 'published' }).sort({
      order: 1,
      createdAt: 1,
    });

    res.json(faqs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllFaqsAdmin,
  createFaqDraft,
  updateFaqDraft,
  publishFaq,
  restoreFaqVersion,
  deleteFaq,
  getFaqs,
};
