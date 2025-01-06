const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: [true, 'ID sản phẩm là bắt buộc'],
    unique: true,
    match: [/^SP\d{3}$/, 'ID sản phẩm phải có định dạng SPxxx (x là số)']
  },
  name: { 
    type: String, 
    required: [true, 'Tên sản phẩm là bắt buộc'],
    minlength: [2, 'Tên sản phẩm phải có ít nhất 2 ký tự'],
    maxlength: [100, 'Tên sản phẩm không được vượt quá 100 ký tự']
  },
  color: { 
    type: String,
    required: [true, 'Màu sắc là bắt buộc'],
    enum: {
      values: ['Đen', 'Trắng', 'Vàng', 'Xanh', 'Đỏ', 'Hồng', 'Tím', 'Xám'],
      message: 'Màu sắc {VALUE} không hợp lệ'
    }
  },
  quantity: { 
    type: Number,
    required: [true, 'Số lượng là bắt buộc'],
    min: [0, 'Số lượng không thể âm'],
    max: [10000, 'Số lượng không thể vượt quá 10000'],
    validate: {
      validator: Number.isInteger,
      message: 'Số lượng phải là số nguyên'
    }
  },
  price: { 
    type: Number,
    required: [true, 'Giá sản phẩm là bắt buộc'],
    min: [0, 'Giá không thể âm'],
    max: [1000000000, 'Giá không thể vượt quá 1 tỷ VNĐ']
  },
  os: { 
    type: String,
    required: [true, 'Hệ điều hành là bắt buộc'],
    enum: {
      values: ['Android', 'IOS'],
      message: 'Hệ điều hành {VALUE} không được hỗ trợ'
    }
  },
  brand: { 
    type: String,
    required: [true, 'Thương hiệu là bắt buộc'],
    enum: {
      values: ['Apple', 'Samsung', 'Oppo', 'Xiaomi', 'Vivo', 'Realme', 'Huawei', 'Nokia', 'LG', 'Lenovo', 'Asus', 'Google', 'Microsoft', 'BlackBerry', 'HTC', 'Sony', 'Motorola', 'OnePlus', 'Razer', 'ZTE', 'Meizu', 'Nubia', 'BlackBerry', 'Palm', 'HP', 'Dell', 'Acer', 'OnePlus', 'Razer', 'ZTE', 'Meizu', 'Nubia', 'BlackBerry', 'Palm', 'HP', 'Dell', 'Acer'],
      message: 'Thương hiệu {VALUE} không được hỗ trợ'
    }
  },
  description: { 
    type: String,
    required: [true, 'Mô tả sản phẩm là bắt buộc'],
    minlength: [10, 'Mô tả phải có ít nhất 10 ký tự'],
    maxlength: [1000, 'Mô tả không được vượt quá 1000 ký tự']
  },
  image: { 
    type: String,
    required: [true, 'Hình ảnh sản phẩm là bắt buộc'],
    validate: {
      validator: function(v) {
        return /\.(jpg|jpeg|png|gif)$/i.test(v);
      },
      message: 'Định dạng hình ảnh không hợp lệ (chấp nhận jpg, jpeg, png, gif)'
    }
  },
  cauhinh: {
    kichThuocManHinh: { 
      type: String,
      required: [true, 'Kích thước màn hình là bắt buộc'],
      match: [/^\d+(\.\d+)?"$/, 'Kích thước màn hình phải có định dạng x" (ví dụ: 6.1")']
    },
    congNgheManHinh: { 
      type: String,
      required: [true, 'Công nghệ màn hình là bắt buộc'],
      enum: {
        values: ['OLED', 'AMOLED', 'LCD', 'IPS LCD', 'Super AMOLED'],
        message: 'Công nghệ màn hình {VALUE} không hợp lệ'
      }
    },
    cameraSau: { 
      type: String,
      required: [true, 'Thông số camera sau là bắt buộc'],
      match: [/^\d+MP/, 'Thông số camera sau không hợp lệ (ví dụ: 48MP)']
    },
    cameraTruoc: { 
      type: String,
      required: [true, 'Thông số camera trước là bắt buộc'],
      match: [/^\d+MP/, 'Thông số camera trước không hợp lệ (ví dụ: 12MP)']
    },
    chipset: { 
      type: String,
      required: [true, 'Chipset là bắt buộc']
    },
    gpu: { 
      type: String,
      required: [true, 'GPU là bắt buộc']
    },
    congNgheNFC: { 
      type: String,
      enum: {
        values: ['Có', 'Không'],
        message: 'Giá trị công nghệ NFC không hợp lệ'
      }
    },
    dungLuongRAM: { 
      type: String,
      required: [true, 'Dung lượng RAM là bắt buộc'],
      match: [/^\d+GB$/, 'Dung lượng RAM phải có định dạng xGB (ví dụ: 8GB)']
    },
    boNhoTrong: { 
      type: String,
      required: [true, 'Bộ nhớ trong là bắt buộc'],
      match: [/^\d+GB$/, 'Bộ nhớ trong phải có định dạng xGB (ví dụ: 128GB)']
    },
    pin: { 
      type: String,
      required: [true, 'Dung lượng pin là bắt buộc'],
      match: [/^\d+mAh$/, 'Dung lượng pin phải có định dạng xmAh (ví dụ: 4000mAh)']
    },
    theSIM: { 
      type: String,
      required: [true, 'Thông tin SIM là bắt buộc'],
      enum: {
        values: ['1 SIM', '2 SIM', 'eSIM'],
        message: 'Loại SIM không hợp lệ'
      }
    },
    doPhanGiaiManHinh: { 
      type: String,
      required: [true, 'Độ phân giải màn hình là bắt buộc'],
      match: [/^\d+x\d+$/, 'Độ phân giải màn hình phải có định dạng AxB (ví dụ: 1920x1080)']
    },
    congSac: { 
      type: String,
      required: [true, 'Cổng sạc là bắt buộc'],
      enum: {
        values: ['Lightning', 'Type-C', 'Micro USB'],
        message: 'Loại cổng sạc không hợp lệ'
      }
    }
  }
});

productSchema.pre('save', function(next) {
  // Validate giá và số lượng
  if (this.price < 0) {
    return next(new Error('Giá sản phẩm không thể âm'));
  }
  if (this.quantity < 0) {
    return next(new Error('Số lượng sản phẩm không thể âm'));
  }
  
  // Validate tên sản phẩm
  if (!this.name || this.name.trim().length < 2) {
    return next(new Error('Tên sản phẩm phải có ít nhất 2 ký tự'));
  }

  // Validate thương hiệu
  if (!this.brand || !['Apple', 'Samsung', 'Oppo', 'Xiaomi', 'Vivo', 'Realme', 'Huawei', 'Nokia', 'LG', 'Lenovo', 'Asus', 'Google', 'Microsoft', 'BlackBerry', 'HTC', 'Sony', 'Motorola', 'OnePlus', 'Razer', 'ZTE', 'Meizu', 'Nubia', 'BlackBerry', 'Palm', 'HP', 'Dell', 'Acer'].includes(this.brand)) {
    return next(new Error('Thương hiệu không hợp lệ'));
  }

  // Validate hệ điều hành
  if (this.os && !['Android', 'IOS'].includes(this.os)) {
    return next(new Error('Hệ điều hành không hợp lệ'));
  }

  // Validate màu sắc
  if (!this.color || this.color.trim().length === 0) {
    return next(new Error('Màu sắc không được để trống'));
  }

  // Validate cấu hình
  if (this.cauhinh) {
    if (!this.cauhinh.kichThuocManHinh) {
      return next(new Error('Kích thước màn hình không được để trống'));
    }
    if (!this.cauhinh.dungLuongRAM) {
      return next(new Error('Dung lượng RAM không được để trống'));
    }
    if (!this.cauhinh.boNhoTrong) {
      return next(new Error('Bộ nhớ trong không được để trống'));
    }
    if (!this.cauhinh.pin || isNaN(parseInt(this.cauhinh.pin))) {
      return next(new Error('Dung lượng pin không hợp lệ'));
    }
  }

  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
