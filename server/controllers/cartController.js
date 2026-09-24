const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to calculate totals from cart items
const calculateCartTotals = async (items) => {
  let subtotal = 0;
  let gstAmount = 0;

  for (const item of items) {
    const itemSubtotal = item.price * item.quantity;
    subtotal += itemSubtotal;
    // Query product to get current GST rate (default 18%)
    const product = await Product.findById(item.productId).select('gst');
    const gstRate = (product && product.gst !== undefined) ? product.gst : 18;
    gstAmount += (itemSubtotal * gstRate) / 100;
  }

  // Round to 2 decimal places
  subtotal = Math.round(subtotal * 100) / 100;
  gstAmount = Math.round(gstAmount * 100) / 100;
  const totalAmount = Math.round((subtotal + gstAmount) * 100) / 100;

  return { subtotal, gstAmount, totalAmount };
};

/**
 * @route   GET /api/cart
 * @desc    Get current user's cart with calculated totals
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate({
      path: 'items.productId',
      select: 'productCode name casNumber image packings purity isActive'
    });

    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const totals = await calculateCartTotals(cart.items);

    res.status(200).json({
      success: true,
      message: 'Cart fetched successfully.',
      data: {
        _id: cart._id,
        userId: cart.userId,
        items: cart.items,
        subtotal: totals.subtotal,
        gstAmount: totals.gstAmount,
        totalAmount: totals.totalAmount,
        itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/cart
 * @desc    Add item to cart with stock validation
 * @access  Private
 */
const addToCart = async (req, res, next) => {
  try {
    const { productId, packingSize, quantity = 1 } = req.body;

    if (!productId || !packingSize) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and packing size are required.'
      });
    }

    const requestedQty = Math.max(1, parseInt(quantity, 10));

    // Verify product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product is no longer available.'
      });
    }

    // Verify packing exists
    const packing = product.packings.find((p) => p.size === packingSize);
    if (!packing) {
      return res.status(400).json({
        success: false,
        message: `Packing size ${packingSize} does not exist for this product.`
      });
    }

    // Check available stock
    if (packing.stock < requestedQty) {
      return res.status(400).json({
        success: false,
        message: `Only ${packing.stock} units are available for ${packing.size}.`
      });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    // Check if item with same productId & packingSize is already in cart
    const existingIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && item.packingSize === packingSize
    );

    if (existingIndex > -1) {
      const newTotalQty = cart.items[existingIndex].quantity + requestedQty;
      if (newTotalQty > packing.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more units. You already have ${cart.items[existingIndex].quantity} in cart and only ${packing.stock} units are available in stock.`
        });
      }
      cart.items[existingIndex].quantity = newTotalQty;
      cart.items[existingIndex].price = packing.price; // Update to current authoritative price
    } else {
      cart.items.push({
        productId: product._id,
        productName: product.name,
        packingSize: packing.size,
        price: packing.price,
        quantity: requestedQty
      });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'productCode name casNumber image packings purity isActive'
    });

    const totals = await calculateCartTotals(populatedCart.items);

    res.status(200).json({
      success: true,
      message: 'Product added to cart successfully.',
      data: {
        _id: populatedCart._id,
        items: populatedCart.items,
        subtotal: totals.subtotal,
        gstAmount: totals.gstAmount,
        totalAmount: totals.totalAmount,
        itemCount: populatedCart.items.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/cart/:itemId
 * @desc    Update quantity of a cart item
 * @access  Private
 */
const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const newQty = parseInt(quantity, 10);
    if (isNaN(newQty)) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity number is required.'
      });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.'
      });
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart.'
      });
    }

    if (newQty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Validate current stock
      const product = await Product.findById(cart.items[itemIndex].productId);
      if (!product) {
        cart.items.splice(itemIndex, 1);
      } else {
        const packing = product.packings.find((p) => p.size === cart.items[itemIndex].packingSize);
        if (!packing) {
          cart.items.splice(itemIndex, 1);
        } else if (newQty > packing.stock) {
          return res.status(400).json({
            success: false,
            message: `Only ${packing.stock} units are available for ${packing.size}.`
          });
        } else {
          cart.items[itemIndex].quantity = newQty;
          cart.items[itemIndex].price = packing.price;
        }
      }
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'productCode name casNumber image packings purity isActive'
    });

    const totals = await calculateCartTotals(populatedCart.items);

    res.status(200).json({
      success: true,
      message: 'Cart updated successfully.',
      data: {
        _id: populatedCart._id,
        items: populatedCart.items,
        subtotal: totals.subtotal,
        gstAmount: totals.gstAmount,
        totalAmount: totals.totalAmount,
        itemCount: populatedCart.items.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/cart/:itemId
 * @desc    Remove an item from cart
 * @access  Private
 */
const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.'
      });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'productCode name casNumber image packings purity isActive'
    });

    const totals = await calculateCartTotals(populatedCart.items);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
      data: {
        _id: populatedCart._id,
        items: populatedCart.items,
        subtotal: totals.subtotal,
        gstAmount: totals.gstAmount,
        totalAmount: totals.totalAmount,
        itemCount: populatedCart.items.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/cart
 * @desc    Clear entire cart
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully.',
      data: {
        items: [],
        subtotal: 0,
        gstAmount: 0,
        totalAmount: 0,
        itemCount: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
