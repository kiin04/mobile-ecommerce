const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  accountName: { type: String, required: true},
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  dayOfBirth: { type: String, required: true },
  gender: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  userAvatar: { type: String},
  cart: [
    {
      productId: String,
      name: String,
      price: Number,
      color: String,
      quantity: Number,
      image: String, 
    },
  ],
});

userSchema.pre('save', function(next) {
  // Validate email
  if (!this.email || !this.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return next(new Error('Email không hợp lệ'));
  }

  // Validate số điện thoại (định dạng Việt Nam)
  if (!this.phoneNumber || !this.phoneNumber.match(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/)) {
    return next(new Error('Số điện thoại không hợp lệ'));
  }

  // Validate mật khẩu (ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt)
  if (!this.password || !this.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
    return next(new Error('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'));
  }

  // Validate tên tài khoản
  if (!this.accountName || this.accountName.length < 3 || this.accountName.length > 20) {
    return next(new Error('Tên tài khoản phải từ 3-20 ký tự'));
  }

  // Validate họ tên
  if (!this.name || this.name.trim().length < 2) {
    return next(new Error('Họ tên phải có ít nhất 2 ký tự'));
  }

  // Validate giới tính
  if (!['Nam', 'Nữ', 'Khác'].includes(this.gender)) {
    return next(new Error('Giới tính không hợp lệ'));
  }

  // Validate ngày sinh
  const birthDate = new Date(this.dayOfBirth);
  const currentDate = new Date();
  const age = currentDate.getFullYear() - birthDate.getFullYear();
  if (age < 18 || age > 100) {
    return next(new Error('Tuổi phải từ 18 đến 100'));
  }

  // Validate địa chỉ
  if (!this.address || this.address.trim().length < 10) {
    return next(new Error('Địa chỉ phải có ít nhất 10 ký tự'));
  }

  // Validate giỏ hàng
  if (this.cart) {
    for (const item of this.cart) {
      if (item.quantity <= 0) {
        return next(new Error('Số lượng sản phẩm trong giỏ hàng phải lớn hơn 0'));
      }
      if (item.price <= 0) {
        return next(new Error('Giá sản phẩm trong giỏ hàng phải lớn hơn 0'));
      }
    }
  }

  // Validate mật khẩu mới (nếu được cập nhật)
  if (this.isModified('password')) {
    if (!this.password || !this.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
      return next(new Error('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'));
    }
  }

  next();
});

userSchema.methods.comparePassword = function(candidatePassword) {
  return this.password === candidatePassword;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
