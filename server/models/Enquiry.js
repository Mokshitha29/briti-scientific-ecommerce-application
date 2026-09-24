const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    officialEmail: {
      type: String,
      required: [true, 'Official email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    chemicalName: {
      type: String,
      required: [true, 'Chemical name is required'],
      trim: true
    },
    casNumber: {
      type: String,
      trim: true,
      default: ''
    },
    requiredQuantity: {
      type: String,
      required: [true, 'Required quantity is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Message / specification is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Resolved'],
      default: 'New'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

enquirySchema.index({ officialEmail: 1 });
enquirySchema.index({ status: 1 });
enquirySchema.index({ createdAt: -1 });

const Enquiry = mongoose.model('Enquiry', enquirySchema);

module.exports = Enquiry;
