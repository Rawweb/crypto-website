const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUser,
  verifyUserEmail,
  deleteUser,
  suspendUser,
  unsuspendUser,
  banUser,
} = require('../controllers/adminUserController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, admin, getAllUsers);
router.get('/:id', protect, admin, getUserById);
router.put('/update/:id', protect, admin, updateUser);
router.put('/verify-email/:id', protect, admin, verifyUserEmail);
router.delete('/delete/:id', protect, admin, deleteUser);
router.put('/suspend/:id', protect, admin, suspendUser);
router.put('/unsuspend/:id', protect, admin, unsuspendUser);
router.put('/ban/:id', protect, admin, banUser);

module.exports = router;
