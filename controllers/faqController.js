const Faq = require('../models/faqModel');

/* ===== ADMIN ===== */
// create FAQ
const createFaq = async (req, res) => {
  const faq = await Faq.create(req.body);
  res.json(faq);
};

// update FAQ
const updateFaq = async (req, res) => {
  const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(faq);
};

// delete FAQ
const deleteFaq = async (req, res) => {
  await Faq.findByIdAndDelete(req.params.id);
  res.json({ message: 'FAQ deleted' });
};

/* ===== PUBLIC ===== */
// get FAQs
const getFaqs = async (req, res) => {
  const faqs = await Faq.find({ isActive: true }).sort({
    order: 1,
    createdAt: 1,
  });
  res.json(faqs);
};

module.exports = {
  createFaq,
  updateFaq,
  deleteFaq,
  getFaqs,
};
