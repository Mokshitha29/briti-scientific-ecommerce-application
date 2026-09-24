const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const generateTransactionId = require('../utils/generateTransactionId');

/**
 * @route   POST /api/payments/process
 * @desc    Simulate demo payment processing (Card / UPI / NetBanking)
 * @access  Private
 */
const processPayment = async (req, res, next) => {
  try {
    const {
      orderId,
      paymentMethod = 'Card',
      cardDetails,
      upiId,
      bankName
    } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required.'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Strict ownership verification
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot pay for another user\'s order.'
      });
    }

    // Duplicate payment protection
    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this order.'
      });
    }

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This order has been cancelled and cannot be paid.'
      });
    }

    let isSuccess = false;
    let failureReason = '';

    // Validate Simulated Payment based on Method
    if (paymentMethod === 'Card') {
      const rawCard = cardDetails?.cardNumber || req.body.cardNumber || '';
      const normalizedCardNumber = String(rawCard).replace(/\s+/g, '');

      // Demo success rule: ONLY 4111 1111 1111 1111 succeeds
      if (normalizedCardNumber === '4111111111111111') {
        isSuccess = true;
      } else {
        failureReason = 'Invalid demo card number. Please use 4111 1111 1111 1111.';
      }
    } else if (paymentMethod === 'UPI') {
      const normalizedUpi = (upiId || req.body.upiId || '').trim().toLowerCase();

      // Demo success rule: ONLY test@upi succeeds
      if (normalizedUpi === 'test@upi') {
        isSuccess = true;
      } else {
        failureReason = 'Invalid demo UPI ID. Please use test@upi.';
      }
    } else if (paymentMethod === 'Net Banking') {
      const selectedBank = (bankName || req.body.bankName || '').trim();

      // Demo success rule: selecting any valid demo bank succeeds
      if (!selectedBank) {
        failureReason = 'Please select a demo bank.';
      } else {
        isSuccess = true;
      }
    } else {
      failureReason = 'Unsupported payment method.';
    }

    const transactionId = generateTransactionId();

    if (!isSuccess) {
      // Record FAILED payment transaction (DO NOT reduce stock, DO NOT clear cart)
      await Payment.create({
        orderId: order._id,
        userId: req.user._id,
        amount: order.totalAmount,
        paymentMethod,
        transactionId,
        paymentStatus: 'FAILED'
      });

      order.paymentStatus = 'Failed';
      await order.save();

      return res.status(400).json({
        success: false,
        message: failureReason || 'Payment failed.',
        data: {
          transactionId,
          orderId: order._id,
          orderNumber: order.orderNumber,
          amount: order.totalAmount,
          paymentStatus: 'FAILED'
        }
      });
    }

    // Payment succeeded - Re-verify stock before finalizing
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productName} is no longer available.`
        });
      }
      const packing = product.packings.find((p) => p.size === item.packingSize);
      if (!packing || packing.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.productName} (${item.packingSize}). Only ${packing ? packing.stock : 0} available.`
        });
      }
    }

    // Decrement stock for each item in MongoDB
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.productId, 'packings.size': item.packingSize },
        { $inc: { 'packings.$.stock': -item.quantity } }
      );
    }

    // Record SUCCESS payment
    await Payment.create({
      orderId: order._id,
      userId: req.user._id,
      amount: order.totalAmount,
      paymentMethod,
      transactionId,
      paymentStatus: 'SUCCESS'
    });

    // Update order status
    order.paymentStatus = 'Paid';
    order.orderStatus = 'Confirmed';
    order.paymentMethod = paymentMethod;
    order.transactionId = transactionId;
    await order.save();

    // Clear user's cart in MongoDB
    await Cart.updateOne({ userId: req.user._id }, { items: [] });

    res.status(200).json({
      success: true,
      message: 'Demo payment completed successfully. Order confirmed.',
      data: {
        transactionId,
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        paymentMethod,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/payments/:orderId
 * @desc    Get payment transactions for an order
 * @access  Private
 */
const getPaymentByOrderId = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    if (req.user.role !== 'ADMIN' && order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    const payments = await Payment.find({ orderId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Payment records retrieved.',
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processPayment,
  getPaymentByOrderId
};
