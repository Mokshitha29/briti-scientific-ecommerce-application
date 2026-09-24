const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const generateOrderNumber = require('../utils/generateOrderNumber');

/**
 * @route   POST /api/orders
 * @desc    Create a pending order from current user cart with authoritative calculations
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod = 'Demo Payment Gateway' } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.email ||
        !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city ||
        !shippingAddress.state || !shippingAddress.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address (Full Name, Email, Phone, Address, City, State, Pincode) is required.'
      });
    }

    // Retrieve user's cart from database
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items before checking out.'
      });
    }

    const orderItems = [];
    let subtotal = 0;
    let gstAmount = 0;

    // Authoritative verification against MongoDB product records
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.productName}" is no longer available.`
        });
      }

      const packing = product.packings.find((p) => p.size === item.packingSize);
      if (!packing) {
        return res.status(400).json({
          success: false,
          message: `Packing size "${item.packingSize}" for "${product.name}" is no longer available.`
        });
      }

      if (packing.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity for "${product.name} (${item.packingSize})" is no longer available. Available stock: ${packing.stock}.`
        });
      }

      const itemPrice = packing.price;
      const lineSubtotal = itemPrice * item.quantity;
      const itemGst = (lineSubtotal * (product.gst !== undefined ? product.gst : 18)) / 100;

      subtotal += lineSubtotal;
      gstAmount += itemGst;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        packingSize: item.packingSize,
        quantity: item.quantity,
        price: itemPrice
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;
    gstAmount = Math.round(gstAmount * 100) / 100;
    const totalAmount = Math.round((subtotal + gstAmount) * 100) / 100;

    // Generate unique order number
    let orderNumber = generateOrderNumber();
    let collisionCheck = await Order.findOne({ orderNumber });
    while (collisionCheck) {
      orderNumber = generateOrderNumber();
      collisionCheck = await Order.findOne({ orderNumber });
    }

    const order = await Order.create({
      orderNumber,
      userId: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        email: shippingAddress.email.trim().toLowerCase(),
        phone: shippingAddress.phone.trim(),
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim()
      },
      subtotal,
      gstAmount,
      totalAmount,
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      paymentMethod
    });

    res.status(201).json({
      success: true,
      message: 'Pending order created successfully. Proceed to demo payment.',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get all orders belonging to current logged-in user
 * @access  Private
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully.',
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/orders/:id
 * @desc    Get order details by ID (enforces ownership unless Admin)
 * @access  Private
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate('items.productId', 'productCode image casNumber');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Strict ownership verification
    if (req.user.role !== 'ADMIN' && order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this order.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order details retrieved successfully.',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById
};
