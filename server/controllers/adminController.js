const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Enquiry = require('../models/Enquiry');
const ContactMessage = require('../models/ContactMessage');
const Category = require('../models/Category');

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get comprehensive admin dashboard KPIs, charts, and alerts
 * @access  Private/Admin
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ role: 'USER' });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const totalEnquiries = await Enquiry.countDocuments();
    const totalContactMessages = await ContactMessage.countDocuments();
    const totalCategories = await Category.countDocuments();

    // STRICT REVENUE CALCULATION: Only include successful/PAID orders
    const revenueAggregation = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? Math.round(revenueAggregation[0].totalRevenue * 100) / 100 : 0;

    // Recent 6 Orders
    const recentOrders = await Order.find()
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(6);

    // Recent 6 Enquiries
    const recentEnquiries = await Enquiry.find()
      .sort({ createdAt: -1 })
      .limit(6);

    // Low Stock Products (any packing stock <= 10)
    const lowStockProducts = await Product.find({
      'packings.stock': { $lte: 10 }
    })
      .populate('category', 'name')
      .limit(10);

    res.status(200).json({
      success: true,
      message: 'Dashboard metrics loaded successfully.',
      data: {
        stats: {
          totalProducts,
          activeProducts,
          totalUsers,
          totalOrders,
          pendingOrders,
          totalEnquiries,
          totalContactMessages,
          totalCategories,
          totalRevenue
        },
        recentOrders,
        recentEnquiries,
        lowStockProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/users
 * @desc    Get all users list
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully.',
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user (protects the last admin account)
 * @access  Private/Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Safety: Protect last admin
    if (userToDelete.role === 'ADMIN') {
      const adminCount = await User.countDocuments({ role: 'ADMIN' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Security protection: Cannot delete the only remaining Administrator account.'
        });
      }
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders with optional status filters
 * @access  Private/Admin
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (orderStatus) filter.orderStatus = orderStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('userId', 'fullName email companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully.',
      data: orders,
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
 * @route   PUT /api/admin/orders/:id/status
 * @desc    Update order status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    const validOrderStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (orderStatus) {
      if (!validOrderStatuses.includes(orderStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid order status. Allowed: ${validOrderStatuses.join(', ')}`
        });
      }
      order.orderStatus = orderStatus;
    }

    const validPaymentStatuses = ['Pending', 'Paid', 'Failed'];
    if (paymentStatus) {
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid payment status. Allowed: ${validPaymentStatuses.join(', ')}`
        });
      }
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully.',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/enquiries
 * @desc    Get all enquiries with optional status filter
 * @access  Private/Admin
 */
const getAllEnquiries = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const total = await Enquiry.countDocuments(filter);
    const enquiries = await Enquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      message: 'Enquiries retrieved successfully.',
      data: enquiries,
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
 * @route   PUT /api/admin/enquiries/:id/status
 * @desc    Update enquiry status (New / Contacted / Resolved)
 * @access  Private/Admin
 */
const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['New', 'Contacted', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid enquiry status. Allowed: ${validStatuses.join(', ')}`
      });
    }

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.'
      });
    }

    enquiry.status = status;
    await enquiry.save();

    res.status(200).json({
      success: true,
      message: 'Enquiry status updated successfully.',
      data: enquiry
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  getAllEnquiries,
  updateEnquiryStatus
};
