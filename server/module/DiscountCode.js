const mongoose = require('mongoose');

const discountCodeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, 'ID mã giảm giá là bắt buộc'],
    unique: true,
    match: [/^VC\d{3}$/, 'ID mã giảm giá phải có định dạng VCxxx (x là số)']
  },
  name: {
    type: String,
    required: [true, 'Tên mã giảm giá là bắt buộc'],
    minlength: [3, 'Tên mã giảm giá phải có ít nhất 3 ký tự']
  },
  code: {
    type: String,
    required: [true, 'Mã giảm giá là bắt buộc'],
    unique: true,
    minlength: [5, 'Mã giảm giá phải có ít nhất 5 ký tự'],
    maxlength: [20, 'Mã giảm giá không được vượt quá 20 ký tự']
  },
  discountPercent: {
    type: Number,
    required: [true, 'Phần trăm giảm giá là bắt buộc'],
    min: [0, 'Phần trăm giảm giá không thể âm'],
    max: [100, 'Phần trăm giảm giá không thể vượt quá 100%']
  },
  startDate: {
    type: Date,
    required: [true, 'Ngày bắt đầu là bắt buộc']
  },
  endDate: {
    type: Date,
    required: [true, 'Ngày kết thúc là bắt buộc'],
    validate: {
      validator: function(endDate) {
        return endDate > this.startDate;
      },
      message: 'Ngày kết thúc phải sau ngày bắt đầu'
    }
  },
  minOrderValue: {
    type: Number,
    required: [true, 'Giá trị đơn hàng tối thiểu là bắt buộc'],
    min: [0, 'Giá trị đơn hàng tối thiểu không thể âm']
  },
  maxDiscountAmount: {
    type: Number,
    required: [true, 'Số tiền giảm tối đa là bắt buộc'],
    min: [0, 'Số tiền giảm tối đa không thể âm']
  }
});

const DiscountCode = mongoose.model('DiscountCode', discountCodeSchema);

module.exports = DiscountCode;
