import mongoose from 'mongoose';

const orderCommentSchema = new mongoose.Schema({
  id: String,
  date: { type: Date, default: Date.now },
  text: String,
  user: String
});

const orderSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  brandEmail: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    default: 'Unpaid'
  },
  amount: {
    type: Number,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  comments: [orderCommentSchema]
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
