const ContactMessage = require('../models/ContactMessage');

/**
 * @route   POST /api/contact
 * @desc    Submit a customer contact message
 * @access  Public / Authenticated User
 */
const submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject, and message are required.'
      });
    }

    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      subject: subject.trim(),
      message: message.trim(),
      userId: req.user ? req.user._id : null
    };

    const contactMessage = await ContactMessage.create(contactData);

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been sent to our technical sales team.',
      data: contactMessage
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/contact
 * @desc    Get all contact messages (with optional status filter & pagination)
 * @access  Private/Admin
 */
const getAllContactMessages = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const total = await ContactMessage.countDocuments(filter);
    const messages = await ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      message: 'Contact messages retrieved successfully.',
      data: messages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/contact/:id
 * @desc    Get single contact message by ID
 * @access  Private/Admin
 */
const getContactMessageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await ContactMessage.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact message retrieved successfully.',
      data: message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/contact/:id/status
 * @desc    Update contact message status (New / Contacted / Resolved)
 * @access  Private/Admin
 */
const updateContactMessageStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['New', 'Contacted', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(', ')}`
      });
    }

    const contactMessage = await ContactMessage.findById(id);
    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.'
      });
    }

    contactMessage.status = status;
    await contactMessage.save();

    res.status(200).json({
      success: true,
      message: 'Contact message status updated successfully.',
      data: contactMessage
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContact,
  getAllContactMessages,
  getContactMessageById,
  updateContactMessageStatus
};
