const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Exact password regex required by specification:
// At least 6 characters, lowercase, uppercase, number, special char, no spaces
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])(?=\S+$)[A-Za-z\d@#$%^&*!]{6,}$/;

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (role is always USER)
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    let { fullName, email, phone, companyName, password, confirmPassword } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required.'
      });
    }

    // Normalize email
    email = email.trim().toLowerCase();

    // Validate password pattern
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters and contain uppercase, lowercase, number and special character.'
      });
    }

    // Check confirm password if provided
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user - strictly USER role
    const newUser = await User.create({
      fullName: fullName.trim(),
      email,
      phone: (phone || '').trim(),
      companyName: (companyName || '').trim(),
      password: hashedPassword,
      role: 'USER',
      isActive: true
    });

    const token = generateToken({
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        user: newUser,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return token
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/profile
 * @desc    Get current logged in user profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'User profile fetched successfully.',
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile (cannot update role)
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, companyName } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (fullName) user.fullName = fullName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (companyName !== undefined) user.companyName = companyName.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
