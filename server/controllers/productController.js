const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering, search, sorting, and pagination
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      purity,
      stock,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12,
      all = 'false'
    } = req.query;

    const query = {};

    // By default, public only gets active products unless explicitly requested by admin
    if (all !== 'true') {
      query.isActive = true;
    }

    // Category filter
    if (category) {
      // Check if it's an ObjectId or category name
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const foundCat = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') });
        if (foundCat) {
          query.category = foundCat._id;
        }
      }
    }

    // Purity filter
    if (purity) {
      query.purity = new RegExp(purity, 'i');
    }

    // Search filter across name, productCode, casNumber, description
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { productCode: searchRegex },
        { casNumber: searchRegex },
        { description: searchRegex }
      ];
    }

    // Price filter
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      query['packings.price'] = priceFilter;
    }

    // Stock status filter
    if (stock === 'in_stock') {
      query['packings.stock'] = { $gt: 0 };
    } else if (stock === 'out_of_stock') {
      query['packings.stock'] = { $lte: 0 };
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'name_asc') sortOption = { name: 1 };
    else if (sort === 'name_desc') sortOption = { name: -1 };
    else if (sort === 'price_asc') sortOption = { 'packings.0.price': 1 };
    else if (sort === 'price_desc') sortOption = { 'packings.0.price': -1 };
    else if (sort === 'code_asc') sortOption = { productCode: 1 };

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 12);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name description')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.status(200).json({
      success: true,
      message: 'Products fetched successfully.',
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/products/:id
 * @desc    Get single product details by ID or Product Code
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id).populate('category', 'name description');
    } else {
      product = await Product.findOne({ productCode: id.toUpperCase() }).populate('category', 'name description');
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product details fetched successfully.',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private/Admin
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      productCode,
      name,
      casNumber,
      category,
      description,
      purity,
      hsnCode,
      gst,
      image,
      packings,
      isActive
    } = req.body;

    if (!productCode || !name || !casNumber || !category || !packings || packings.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product code, name, CAS number, category, and at least one packing option are required.'
      });
    }

    const existing = await Product.findOne({ productCode: productCode.trim().toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Product with code ${productCode} already exists.`
      });
    }

    const product = await Product.create({
      productCode: productCode.trim().toUpperCase(),
      name: name.trim(),
      casNumber: casNumber.trim(),
      category,
      description: description || '',
      purity: purity || 'AR',
      hsnCode: hsnCode || '38029019',
      gst: gst !== undefined ? Number(gst) : 18,
      image: image || '',
      packings,
      isActive: isActive !== undefined ? isActive : true
    });

    const populated = await Product.findById(product._id).populate('category', 'name description');

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/products/:id
 * @desc    Update an existing product
 * @access  Private/Admin
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const {
      productCode,
      name,
      casNumber,
      category,
      description,
      purity,
      hsnCode,
      gst,
      image,
      packings,
      isActive
    } = req.body;

    if (productCode && productCode.trim().toUpperCase() !== product.productCode) {
      const duplicate = await Product.findOne({
        productCode: productCode.trim().toUpperCase(),
        _id: { $ne: id }
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Product code ${productCode} is already used by another product.`
        });
      }
      product.productCode = productCode.trim().toUpperCase();
    }

    if (name) product.name = name.trim();
    if (casNumber) product.casNumber = casNumber.trim();
    if (category) product.category = category;
    if (description !== undefined) product.description = description;
    if (purity) product.purity = purity;
    if (hsnCode) product.hsnCode = hsnCode;
    if (gst !== undefined) product.gst = Number(gst);
    if (image !== undefined) product.image = image;
    if (packings && packings.length > 0) product.packings = packings;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();
    const updated = await Product.findById(id).populate('category', 'name description');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private/Admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
