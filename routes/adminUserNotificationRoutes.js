const express = require('express')
const { notifyUser, notifyMultipleUsers, notifyAllUsers } = require('../controllers/adminUserNotificationController')
const { protect, admin } = require('../middlewares/authMiddleware')

const router = express.Router()

router.post('/user', protect, admin, notifyUser)
router.post('/users', protect, admin, notifyMultipleUsers)
router.post('/broadcast', protect, admin, notifyAllUsers)

module.exports = router