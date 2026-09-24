const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  getAllEnquiries,
  updateEnquiryStatus
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Protect all admin routes
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/enquiries', getAllEnquiries);
router.put('/enquiries/:id/status', updateEnquiryStatus);

module.exports = router;
