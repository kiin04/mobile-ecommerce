const mongoose = require('mongoose');

const khoSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Xuất', 'Nhập'], required: true }, 
  managementPerson: { type: String, required: true }, 
  responsiblePerson: { type: String, required: true }, 
  date: { type: Date, required: true },
  warehouseCode: { type: String, required: true }, 
  location: { type: String, required: true }, 
  notes: { type: String } ,
  products: [{
    productId: { type: String, required: true },
    productName: { type: String, required: true }, 
    color: { type: String, required: true },
    quantity: { type: Number, required: true }
  }],
});

khoSchema.pre('save', function(next) {
  // Validate loại phiếu
  if (!['Xuất', 'Nhập'].includes(this.type)) {
    return next(new Error('Loại phiếu kho không hợp lệ'));
  }

  // Validate người quản lý và người chịu trách nhiệm
  if (!this.managementPerson || this.managementPerson.trim().length < 3) {
    return next(new Error('Tên người quản lý phải có ít nhất 3 ký tự'));
  }
  if (!this.responsiblePerson || this.responsiblePerson.trim().length < 3) {
    return next(new Error('Tên người chịu trách nhiệm phải có ít nhất 3 ký tự'));
  }

  // Validate ngày
  const currentDate = new Date();
  if (this.date > currentDate) {
    return next(new Error('Ngày không thể trong tương lai'));
  }

  // Validate vị trí
  if (!this.location || this.location.trim().length < 5) {
    return next(new Error('Vị trí kho phải có ít nhất 5 ký tự'));
  }

  // Validate sản phẩm trong kho
  if (!this.products || this.products.length === 0) {
    return next(new Error('Phiếu kho phải có ít nhất một sản phẩm'));
  }

  // Validate từng sản phẩm trong danh sách
  for (const product of this.products) {
    if (product.quantity <= 0) {
      return next(new Error('Số lượng sản phẩm phải lớn hơn 0'));
    }
    if (!product.productName || product.productName.trim().length < 2) {
      return next(new Error('Tên sản phẩm không hợp lệ'));
    }
    if (!product.color || product.color.trim().length === 0) {
      return next(new Error('Màu sắc sản phẩm không được để trống'));
    }
  }

  next();
});

const Kho = mongoose.model('Kho', khoSchema);

module.exports = Kho;
