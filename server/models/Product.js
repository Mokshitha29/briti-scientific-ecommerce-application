const mongoose = require('mongoose');

const packingSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: [true, 'Packing size is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Packing price is required'],
      min: [0, 'Price must be non-negative']
    },
    stock: {
      type: Number,
      required: [true, 'Packing stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    }
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      required: [true, 'Product code is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    casNumber: {
      type: String,
      required: [true, 'CAS Number is required'],
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    description: {
      type: String,
      default: ''
    },
    purity: {
      type: String,
      required: [true, 'Purity grade is required'],
      default: 'AR'
    },
    hsnCode: {
      type: String,
      required: [true, 'HSN code is required'],
      default: '38029019'
    },
    gst: {
      type: Number,
      default: 18,
      min: 0,
      max: 100
    },
    image: {
      type: String,
      default: ''
    },
    packings: {
      type: [packingSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Product must have at least one packing option.'
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

productSchema.index({ name: 1 });
productSchema.index({ casNumber: 1 });
productSchema.index({ category: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
