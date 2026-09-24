const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  submitContact,
  getAllContactMessages,
  getContactMessageById,
  updateContactMessageStatus
} = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Optional auth middleware for submitting contact messages
const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'briti_scientific_jwt_secret_key_2026_prod');
      req.user = await User.findById(decoded.userId).select('-password');
    } catch (e) {
      req.user = null;
    }
  }
  next();
};

// Customer / Public contact submission
router.post('/', optionalProtect, submitContact);

// Admin-only management endpoints
router.get('/', protect, adminOnly, getAllContactMessages);
router.get('/:id', protect, adminOnly, getContactMessageById);
router.put('/:id/status', protect, adminOnly, updateContactMessageStatus);

module.exports = router;
