const Enquiry = require('../models/Enquiry');

/**
 * @route   POST /api/enquiries
 * @desc    Submit a chemical product enquiry
 * @access  Public (Optionally authenticated)
 */
const submitEnquiry = async (req, res, next) => {
  try {
    const {
      companyName,
      customerName,
      officialEmail,
      phone,
      chemicalName,
      casNumber,
      requiredQuantity,
      message
    } = req.body;

    if (!companyName || !customerName || !officialEmail || !phone || !chemicalName || !requiredQuantity || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required enquiry fields.'
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(officialEmail.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid official email address.'
      });
    }

    const enquiry = await Enquiry.create({
      companyName: companyName.trim(),
      customerName: customerName.trim(),
      officialEmail: officialEmail.trim().toLowerCase(),
      phone: phone.trim(),
      chemicalName: chemicalName.trim(),
      casNumber: (casNumber || '').trim(),
      requiredQuantity: requiredQuantity.trim(),
      message: message.trim(),
      status: 'New',
      userId: req.user ? req.user._id : null
    });

    res.status(201).json({
      success: true,
      message: 'Your chemical enquiry has been submitted successfully. Our technical team will reach out shortly.',
      data: enquiry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/enquiries/my-enquiries
 * @desc    Get enquiries submitted by current user
 * @access  Private
 */
const getMyEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find({
      $or: [
        { userId: req.user._id },
        { officialEmail: req.user.email }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'User enquiries retrieved successfully.',
      data: enquiries
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitEnquiry,
  getMyEnquiries
};
