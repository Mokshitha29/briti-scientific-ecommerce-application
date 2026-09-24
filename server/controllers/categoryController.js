const Category = require('../models/Category');
const Product = require('../models/Product');

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    const { all = 'false' } = req.query;
    const filter = all === 'true' ? {} : { isActive: true };

    const categories = await Category.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      message: 'Categories fetched successfully.',
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category by ID
 * @access  Public
 */
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category fetched successfully.',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Private/Admin
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.'
      });
    }

    const existing = await Category.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists.'
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || '',
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/categories/:id
 * @desc    Update an existing category
 * @access  Private/Admin
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
      const existing = await Category.findOne({
        name: new RegExp(`^${name.trim()}$`, 'i'),
        _id: { $ne: id }
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Another category with this name already exists.'
        });
      }
      category.name = name.trim();
    }

    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/categories/:id
 * @desc    Safe delete a category (fails if products reference it)
 * @access  Private/Admin
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    // Check for associated products
    const associatedProductsCount = await Product.countDocuments({ category: id });
    if (associatedProductsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category because ${associatedProductsCount} products are associated with it. Please reassign or delete the products first.`
      });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
