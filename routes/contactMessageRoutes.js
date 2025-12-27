const express = require('express')
const {submitContactForm } = require('../controllers/contactMessageController')

const router = express.Router()

router.post('/submit', submitContactForm)

module.exports = router