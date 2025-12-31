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
router.put('/:id/update', protect, admin, updateUser);
router.put('/:id/verify-email', protect, admin, verifyUserEmail);
router.delete('/:id/delete', protect, admin, deleteUser);
router.put('/:id/suspend', protect, admin, suspendUser);
router.put('/:id/unsuspend', protect, admin, unsuspendUser);
router.put('/:id/ban', protect, admin, banUser);

module.exports = router;
