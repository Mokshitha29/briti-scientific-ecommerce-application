const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { submitEnquiry, getMyEnquiries } = require('../controllers/enquiryController');
const { protect } = require('../middleware/authMiddleware');

// Optional auth middleware for submitting enquiry
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

router.post('/', optionalProtect, submitEnquiry);
router.get('/my-enquiries', protect, getMyEnquiries);

module.exports = router;
