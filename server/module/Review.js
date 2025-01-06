const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, 'ID đánh giá là bắt buộc'],
    unique: true,
    match: [/^RV\d{3}$/, 'ID đánh giá phải có định dạng RVxxx (x là số)']
  },
  userId: {
    type: String,
    required: [true, 'ID người dùng là bắt buộc']
  },
  productId: {
    type: String,
    required: [true, 'ID sản phẩm là bắt buộc']
  },
  rating: {
    type: Number,
    required: [true, 'Điểm đánh giá là bắt buộc'],
    min: [1, 'Điểm đánh giá tối thiểu là 1'],
    max: [5, 'Điểm đánh giá tối đa là 5']
  },
  comment: {
    type: String,
    required: [true, 'Nội dung đánh giá là bắt buộc'],
    minlength: [10, 'Nội dung đánh giá phải có ít nhất 10 ký tự'],
    maxlength: [500, 'Nội dung đánh giá không được vượt quá 500 ký tự']
  },
  reviewDate: {
    type: Date,
    default: Date.now,
    validate: {
      validator: function(date) {
        return date <= new Date();
      },
      message: 'Ngày đánh giá không thể trong tương lai'
    }
  }
});

module.exports = reviewSchema;

