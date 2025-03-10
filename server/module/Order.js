const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  shippingAddress: { type: String, required: true }, 
  items: [
    {
      productId: { type: String, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  paymentMethod: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    required: true, 
    default: 'Chờ xác nhận',
    enum: [
      'Chờ xác nhận',
      'Đã xác nhận', 
      'Đang xử lý',
      'Đang giao hàng', 
      'Đã giao hàng', 
      'Đã thanh toán',
      'Thanh toán lỗi',
      'Đã hủy',
      'Đã hoàn tiền'
    ]
  },
  orderDate: { type: Date, required: true, default: Date.now }, 
  notes: { type: String },
  cancellationReason: { type: String },
  cancelledAt: { type: Date },
  momoOrderId: {
    type: String,
    sparse: true
  }
});

orderSchema.pre('save', function(next) {
  if (this.totalAmount < 0) {
    return next(new Error('Tổng số tiền không thể âm'));
  }
  if (!['Chờ xác nhận', 'Đã xác nhận', 'Đang xử lý', 'Đang giao hàng', 'Đã giao hàng', 'Đã thanh toán', 'Thanh toán lỗi', 'Đã hủy', 'Đã hoàn tiền'].includes(this.status)) {
    return next(new Error('Trạng thái đơn hàng không hợp lệ'));
  }
  if (!this.items || this.items.length === 0) {
    return next(new Error('Đơn hàng phải có ít nhất một sản phẩm'));
  }
  if (!this.shippingAddress || this.shippingAddress.trim().length === 0) {
    return next(new Error('Địa chỉ giao hàng không được để trống'));
  }
  if (!['Tiền mặt', 'MoMo', 'VNPay','Chuyển khoản ngân hàng'].includes(this.paymentMethod)) {
    return next(new Error('Phương thức thanh toán không hợp lệ'));
  }
  if (this.status === 'Đã hủy' && !this.cancellationReason) {
    return next(new Error('Phải có lý do khi hủy đơn hàng'));
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
