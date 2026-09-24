const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'Card'
    },
    transactionId: {
      type: String,
      required: true,
      unique: true
    },
    paymentStatus: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      required: true
    }
  },
  {
    timestamps: true
  }
);

paymentSchema.index({ orderId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
