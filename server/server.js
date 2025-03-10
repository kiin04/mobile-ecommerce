const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const Buffer = require('buffer').Buffer;
const connectDB = require('./module/db.js');
const { loginAdmin } = require('./module/adminLogin.js');
const Product = require('./module/Product.js');
const Counter = require('./module/Counter.js');
const Order = require('./module/Order.js');
const Kho = require('./module/Kho.js');
const User = require('./module/user.js');
const DiscountCode = require('./module/DiscountCode.js');
const config = require('./config.js')
const multer = require('multer');
const path = require('path');
const { ObjectId } = require('mongodb');

const app = express(); // Initialize express app

// Cấu hình multer để lưu trữ hình ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Thêm timestamp vào tên file
  },
});

const upload = multer({ storage });

app.use(cors({
  origin: ['http://localhost:5173','http://localhost:5174', 'http://4.242.20.80:5174','http://4.242.20.80:5173']
}));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Để truy cập hình ảnh qua đường dẫn

// Kết nối đến MongoDB
connectDB();

// Helper function to adjust product stock
const adjustProductStock = async (items, revert = false) => {
  for (const item of items) {
    const product = await Product.findOne({ id: item.productId });
    if (product) {
      const adjustedQuantity = revert ? product.quantity + item.quantity : product.quantity - item.quantity;
      await Product.findOneAndUpdate(
        { id: item.productId },
        { quantity: adjustedQuantity },
        { new: true }
      );
    }
  }
};

// Login endpoint
app.post('/loginAdmin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await loginAdmin(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});


// Get orders by customer ID
app.get('/api/orders/customer/:customerId', async (req, res) => {
  const { customerId } = req.params;
  try {
    const orders = await Order.find({ customerId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
});



// Updated Registration route to handle user avatar upload
app.post('/api/register', upload.single('userAvatar'), async (req, res) => {
  const { name, accountName, gender, address, phoneNumber, dayOfBirth, email, password } = req.body;

  try {
    // Check if email, phoneNumber, or accountName already exists
    const emailExists = await User.findOne({ email });
    const phoneNumberExists = await User.findOne({ phoneNumber });
    const accountNameExists = await User.findOne({ accountName }); // Check for account name uniqueness

    if (emailExists || phoneNumberExists || accountNameExists) {
      return res.status(400).json({
        message: "Email, số điện thoại hoặc tên ti khoản đã tồn tại.",
        emailExists: !!emailExists,
        phoneNumberExists: !!phoneNumberExists,
        accountNameExists: !!accountNameExists, // Add this field to the response
      });
    }

    // Generate unique user ID in the format KH0001, KH0002, etc.
    const lastUser = await User.findOne().sort({ id: -1 });
    const lastId = lastUser ? parseInt(lastUser.id.substring(2), 10) : 0;
    const userId = `KH${(lastId + 1).toString().padStart(3, '0')}`;
    const defaultAvatarUrl = 'https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg';

    // Create new user document
    const newUser = new User({
      id: userId,
      name,
      accountName, // Include account name here
      email,
      phoneNumber,
      dayOfBirth,
      gender,
      address,
      password,
      userAvatar: req.file ? req.file.path : defaultAvatarUrl, // Use uploaded file path or default URL
    });

    // Save the new user to the database
    await newUser.save();

    // Success response
    res.status(201).json({ message: "Đăng ký thành công!" });

  } catch (error) {
    // Error handling
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình đăng ký.", error: error.message});
  }
});





// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không hợp lệ' });
  }

  if (user.password !== password) {
    return res.status(400).json({ message: 'Email hoặc mật khẩu không hợp lệ' });
  }

  res.status(200).json({
    message: 'Đăng nhập thành công',
    user: {
      userId: user.id,
      accountName: user.accountName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      userAvatar: user.userAvatar
    }
  });
} catch (error) {
  console.error('Error logging in:', error);
  res.status(500).json({ message: 'Đã xảy ra lỗi trong quá trình đăng nhập.', error: error.message });
}
});



// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
});

// Get order by ID
app.get('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findOne({ id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order', error: err.message });
  }
});

// Create new order and reduce product stock
app.post('/api/orders', async (req, res) => {
  try {
    console.log('Received order data:', req.body); // Log dữ liệu nhận được

    const { customerId, customerName, shippingAddress, items, paymentMethod, totalAmount, orderStatus, paymentStatus, orderDate, notes } = req.body;

    // Validate dữ liệu đầu vào
    if (!customerId || !customerName || !shippingAddress || !items || !paymentMethod) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        receivedData: req.body 
      });
    }

    const counter = await Counter.findByIdAndUpdate(
      { _id: 'orderId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // Chuyển đổi orderDate từ string sang Date object
    const parsedOrderDate = orderDate ? new Date(orderDate) : new Date();

    const newOrder = new Order({
      id: `OD${String(counter.seq).padStart(3, '0')}`,
      customerId,
      customerName,
      shippingAddress,
      items,
      paymentMethod,
      totalAmount,
      status: orderStatus || 'Chờ xác nhận',
      paymentStatus: paymentStatus || 'Chưa thanh toán',
      orderDate: parsedOrderDate,
      notes,
    });

    await newOrder.save();
        // Thực hiện điều chỉnh stock
    await adjustProductStock(items);
    res.status(201).json({ 
      message: 'Order created successfully', 
      order: newOrder 
    });
  } catch (err) {
    console.error('Error creating order:', err); // Log chi tiết lỗi
    res.status(500).json({ 
      message: 'Error creating order', 
      error: err.message,
      stack: err.stack // Thêm stack trace để debug
    });
  }
});


// Update order, adjust stock if necessary
app.put('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status, paymentStatus, items, shippingAddress, orderDate } = req.body;

  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { id },
      { status, paymentStatus, items, shippingAddress, orderDate },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order updated successfully', order: updatedOrder });
  } catch (err) {
    res.status(500).json({ message: 'Error updating order', error: err.message });
  }
});

// Delete order and revert product stock
app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const orderToDelete = await Order.findOne({ id });
    if (!orderToDelete) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Revert the stock for this order
    await adjustProductStock(orderToDelete.items, true);

    // Use deleteOne() to delete the order
    await Order.deleteOne({ id: orderToDelete.id });

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting order', error: err.message });
  }
});



// Endpoint để lấy ID tiếp theo
app.get('/api/counter/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: id },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    res.json({ seq: counter.seq });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy ID tiếp theo' });
  }
});

// Thêm sản phẩm
app.post('/api/addProduct', upload.single('image'), async (req, res) => {
  try {


    const { name, color, quantity, price, os, brand, description, cauhinh } = req.body;

    // Validate dữ liệu đầu vào
    if (!name || !price) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    const counter = await Counter.findByIdAndUpdate(
      { _id: 'productId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const newProduct = new Product({
      id: `SP${String(counter.seq).padStart(3, '0')}`,
      name,
      color,
      quantity: Number(quantity),
      price: Number(price),
      os,
      brand,
      description,
      image: req.file ? req.file.path : null,
      cauhinh: JSON.parse(cauhinh),
    });

    await newProduct.save();
    res.status(201).json({ 
      message: 'Sản phẩm đã được thêm thành công!', 
      id: newProduct.id 
    });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ 
      message: 'Lỗi khi thêm sản phẩm', 
      error: err.message 
    });
  }
});

// Hiển thị tất cả sản phẩm
app.get('/api/products', async (req, res) => {
  try {
    const { query} = req.query;
    const searchCondition = {
      ...(query ? { name: { $regex: query, $options: 'i' } } : {})
    };

    const products = await Product.find(searchCondition);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
});

// Fetch available colors
app.get('/api/colors', async (req, res) => {
  try {
    const products = await Product.find({});
    const colors = [...new Set(products.map(product => product.color))]; // Get unique colors
    res.json(colors);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching colors', error: err.message });
  }
});

app.get('/api/brands', async (req, res) => {
  try {
    const products = await Product.find({});
    const brands = [...new Set(products.map(product => product.brand))]; // Get unique brands
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching brands', error: err.message });
  }
});




// Sửa thông tin sản phẩm
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Nếu có dữ liệu cauhinh, parse chuỗi JSON thành object
  if (updateData.cauhinh) {
    updateData.cauhinh = JSON.parse(updateData.cauhinh);
  }
  if (req.file) {
    updateData.image = req.file.path;
  }
  try {
    const updatedProduct = await Product.findOneAndUpdate({ id }, updateData, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }
    res.json({ message: 'Sản phẩm đã được cập nhật thành công!', product: updatedProduct });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm', error: err.message });
  }
});


// Xóa sản phẩm
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Kiểm tra xem sản phẩm có đang được sử dụng không
    const orderWithProduct = await Order.findOne({
      'items.productId': id
    });

    const khoWithProduct = await Kho.findOne({
      'products.productId': id
    });

    if (orderWithProduct || khoWithProduct) {
      return res.status(400).json({ 
        message: 'Không thể xóa sản phẩm vì đang được sử dụng trong đơn hàng hoặc phiếu kho' 
      });
    }

    const deletedProduct = await Product.findOneAndDelete({ id });
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }
    res.json({ message: 'Sản phẩm đã được xóa thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error: err.message });
  }
});

// Lấy sản phẩm theo ID và các màu sắc có sẵn
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Lấy sản phẩm theo ID
    const product = await Product.findOne({ id });

    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    // Lấy tất cả sản phẩm cùng tên, gi và thương hiệu nhưng khác màu
    const availableColors = await Product.find({
      name: product.name,
      brand: product.brand,
    }).select('id color');

    // Trả về sản phẩm cùng với các màu sắc có sẵn
    res.json({
      product,
      availableColors: availableColors.map(p => ({ id: p.id, color: p.color })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin sản phẩm', error: err.message });
  }
});


// Get all kho entries
app.get('/api/kho', async (req, res) => {
  try {
    const khoEntries = await Kho.find();
    res.json(khoEntries);
  } catch (err) {
    console.error('Error fetching kho entries:', err.message);
    res.status(500).json({ message: 'Error fetching kho entries', error: err.message });
  }
});

// Get kho entry by ID
app.get('/api/kho/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const khoEntry = await Kho.findOne({ id });
    if (!khoEntry) {
      console.warn(`Kho entry with ID ${id} not found`);
      return res.status(404).json({ message: 'Kho entry not found' });
    }
    res.json(khoEntry);
  } catch (err) {
    console.error('Error fetching kho entry:', err.message);
    res.status(500).json({ message: 'Error fetching kho entry', error: err.message });
  }
});

// Create new kho entry
app.post('/api/kho', async (req, res) => {
  const { id, type, managementPerson, responsiblePerson, date, warehouseCode, location, notes, products} = req.body;

  const newKhoEntry = new Kho({
    id,
    type,
    managementPerson,
    responsiblePerson,
    date,
    warehouseCode,
    location,
    notes,
    products
  });

  try {
    await newKhoEntry.save();
    res.status(201).json({ message: 'Kho entry created successfully', khoEntry: newKhoEntry });
  } catch (err) {
    console.error('Error creating kho entry:', err.message);
    res.status(500).json({ message: 'Error creating kho entry', error: err.message });
  }
});

// Update kho entry
app.put('/api/kho/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedKhoEntry = await Kho.findOneAndUpdate({ id }, updateData, { new: true });
    if (!updatedKhoEntry) {
      console.warn(`Kho entry with ID ${id} not found for update`);
      return res.status(404).json({ message: 'Kho entry not found' });
    }
    res.json({ message: 'Kho entry updated successfully', khoEntry: updatedKhoEntry });
  } catch (err) {
    console.error('Error updating kho entry:', err.message);
    res.status(500).json({ message: 'Error updating kho entry', error: err.message });
  }
});

// Delete kho entry
app.delete('/api/kho/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedKhoEntry = await Kho.findOneAndDelete({ id });
    if (!deletedKhoEntry) {
      console.warn(`Kho entry with ID ${id} not found for deletion`);
      return res.status(404).json({ message: 'Kho entry not found' });
    }
    res.json({ message: 'Kho entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting kho entry', error: err.message });
  }
});
// Get user info by email (including id)
app.get('/api/users/email/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    // Return the user info along with the id
    const { password, ...userInfo } = user.toObject();
    res.json(userInfo); // Send the filtered user object back as the response
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin ngời dùng', error: err.message });
  }
});


// Hiển thị tất cả người dùng
app.get('/api/users', async (req, res) => {
  try {
    const user = await User.find();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy sản phẩm', error: err.message });
  }
});

// generate unique ID cho User (dạng KHxxx)
const generateCustomerId = async () => {
  const counter = await Counter.findByIdAndUpdate(
    { _id: 'customerId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `KH${String(counter.seq).padStart(3, '0')}`;
};

// Thêm người dùng mới
app.post('/api/addUser', async (req, res) => {
  const { name, email, phoneNumber, dayOfBirth, gender, address, accountName, password } = req.body;

  try {
    // Kiểm tra đồng thời email, số điện thoại và tên tài khoản
    const existingUser = await User.findOne({
      $or: [
        { email },
        { phoneNumber },
        { accountName }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email, số điện thoại hoặc tên tài khoản đã tồn tại.",
        emailExists: existingUser.email === email,
        phoneExists: existingUser.phoneNumber === phoneNumber,
        accountNameExists: existingUser.accountName === accountName
      });
    }

    // Tạo ID cho khách hàng mới
    const userId = await generateCustomerId();

    // Tạo người dùng mới
    const newUser = new User({
      id: userId,
      name,
      email,
      phoneNumber,
      dayOfBirth,
      gender,
      address,
      accountName,
      password,
      role: 'user',
      userAvatar: 'https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg'
    });

    await newUser.save();
    res.status(201).json({ message: 'Người dùng đã được thêm thành công', user: newUser });
  } catch (err) {
    console.error('Error creating user:', err); // Thêm log để debug
    res.status(500).json({ 
      message: 'Lỗi khi thêm người dùng', 
      error: err.message 
    });
  }
});


// Xóa người dùng
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findOneAndDelete({ id });
    if (!deletedUser) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    res.json({ message: 'Người dùng đã được xóa thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa người dùng', error: err.message });
  }
});

// ADD
app.post('/api/users', async (req, res) => {
  const { name, email, phoneNumber, dayOfBirth, gender, address, accountName, password, role, userAvatar } = req.body;

  try {
    // Kiểm tra xem email đã tồn tại hay chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Tạo ID cho khách hàng mới
    const userId = await generateCustomerId();

    // Tạo người dùng mới với tất c các trường
    const newUser = new User({
      id: userId,
      name,
      email,
      phoneNumber,
      dayOfBirth,
      gender,
      address,
      accountName,
      password,
      role: role || 'user',
      userAvatar
    });

    await newUser.save();
    res.status(201).json({ message: 'Người dùng đã được thêm thành công', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi thêm người dùng', error: err.message });
  }
});


// SỬA
app.put('/api/users/:id', upload.single('avatar'), async (req, res) => {
  const { name, email, phoneNumber, dayOfBirth, gender, address, accountName, currentPassword, newPassword } = req.body;
  const { id } = req.params;

  try {
    const user = await User.findOne({ id });
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    // Kiểm tra mật khẩu hiện tại nếu người dùng muốn đổi mật khẩu
    if (newPassword) {
      if (user.password !== currentPassword) {
        return res.status(400).json({ message: 'Mật khẩu hiện tại khng đúng' });
      }
      // Sửa regex để khớp với client
      if (!newPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
        return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt' });
      }
    }

    const userAvatar = req.file ? req.file.path : undefined;

    const updateData = {
      name,
      email,
      phoneNumber,
      dayOfBirth,
      gender,
      address,
      accountName,
      ...(newPassword && { password: newPassword }),
      ...(userAvatar && { userAvatar }),
    };

    const updatedUser = await User.findOneAndUpdate(
      { id }, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    res.json({ 
      message: 'Người dùng đã được cập nhật thành công', 
      user: updatedUser 
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Lỗi khi cập nhật người dùng', 
      error: err.message 
    });
  }
});

// GET
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params; // Lấy ID từ params

  try {
    const user = await User.findOne({ id }); // Tìm theo trường id
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng', error: err.message });
  }
});

// Helper để tạo ID tự động cho mã giảm giá (VC000)
const generateDiscountId = async () => {
  const counter = await Counter.findByIdAndUpdate(
    { _id: 'discountCodeId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `VC${String(counter.seq).padStart(3, '0')}`;
};

// Lấy danh sách tất cả mã giảm giá
app.get('/api/discountCodes', async (req, res) => {
  try {
    const discountCodes = await DiscountCode.find();
    res.json(discountCodes);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách mã giảm giá', error: err.message });
  }
});

// Thêm mã giảm giá mới
app.post('/api/addDiscountCode', async (req, res) => {
    try {
        const discountId = await generateDiscountId();
        const { name, code, discountPercent, startDate, endDate, minOrderValue, maxDiscountAmount } = req.body;

        const newDiscountCode = new DiscountCode({
            id: discountId,
            code,
            name,
            discountPercent,
            startDate,
            endDate,
            minOrderValue,
            maxDiscountAmount
        });

        await newDiscountCode.save();
        res.status(201).json({ 
            message: 'Mã giảm giá đã được tạo thành công!', 
            discountCode: newDiscountCode 
        });
    } catch (err) {
        console.error('Lỗi khi tạo mã giảm giá:', err);
        res.status(500).json({ 
            message: 'Lỗi khi tạo mã giảm giá', 
            error: err.message 
        });
    }
});







// Sửa thông tin mã giảm giá
app.put('/api/discountCodes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const discountCode = await DiscountCode.findOne({ id }); // Tìm theo id không phải _id
        if (!discountCode) {
            return res.status(404).json({ message: 'Khng tìm thấy mã giảm giá' });
        }

        const { name, startDate, endDate, discountPercent, code, minOrderValue, maxDiscountAmount } = req.body;
        
        // Cập nhật các trường
        discountCode.name = name;
        discountCode.startDate = startDate;
        discountCode.endDate = endDate;
        discountCode.discountPercent = discountPercent;
        discountCode.code = code;
        discountCode.minOrderValue = minOrderValue;
        discountCode.maxDiscountAmount = maxDiscountAmount;

        await discountCode.save();
        
        res.json({ 
            message: 'Cập nhật mã giảm giá thành công', 
            discountCode 
        });
    } catch (err) {
        console.error('Lỗi khi cập nhật mã giảm giá:', err);
        res.status(500).json({ 
            message: 'Lỗi khi cập nhật mã giảm giá', 
            error: err.message 
        });
    }
});



// Xóa mã giảm giá
app.delete('/api/discountCodes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedDiscountCode = await DiscountCode.findOneAndDelete({ id });
    if (!deletedDiscountCode) {
      return res.status(404).json({ message: 'Mã giảm giá không tồn tại' });
    }

    res.json({ message: 'Mã giảm giá đã được xóa thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa mã giảm giá', error: err.message });
  }
});

// Lấy thông tin mã giảm giá theo ID
app.get('/api/discountCodes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const discountCode = await DiscountCode.findOne({ id });
    if (!discountCode) {
      return res.status(404).json({ message: 'Mã giảm giá không tồn tại' });
    }

    res.json(discountCode);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin mã giảm giá', error: err.message });
  }
});

// Thêm sản phẩm vào giỏ hàng
app.post('/api/cart/:userId/add', async (req, res) => {
  const { userId } = req.params;
  const { productId, name, price, color, quantity, image } = req.body;

  try {
    // Tìm user
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng' });
    }

    // Kiểm tra sản phẩm trong kho
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    // Kiểm tra số lượng tồn kho
    if (quantity > product.quantity) {
      return res.status(400).json({ 
        message: `Số lượng yêu cầu vượt quá tồn kho. Chỉ còn ${product.quantity} sản phẩm.` 
      });
    }

    // Tìm vị trí của sản phẩm trong giỏ hàng (nếu có)
    const existingItemIndex = user.cart.findIndex(item => 
      item.productId === productId && 
      item.color === color
    );

    if (existingItemIndex !== -1) {
      // Nếu sản phẩm đã tồn tại
      const newQuantity = user.cart[existingItemIndex].quantity + quantity;
      
      // Kiểm tra số lượng mới có vượt quá tồn kho không
      if (newQuantity > product.quantity) {
        return res.status(400).json({ 
          message: `Tổng số lượng vượt quá tồn kho. Chỉ còn ${product.quantity} sản phẩm.` 
        });
      }

      // Cập nhật số lượng mới
      user.cart[existingItemIndex].quantity = newQuantity;
    } else {
      // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới
      user.cart.push({
        productId,
        name,
        price,
        color,
        quantity,
        image
      });
    }

    // Lưu giỏ hàng đã cập nhật
    await user.save();
    
    res.status(200).json({ 
      message: 'Đã thêm sản phẩm vào giỏ hàng thành công',
      cart: user.cart 
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      message: 'Lỗi khi thêm sản phẩm vào giỏ hàng',
      error: error.message 
    });
  }
});

// Cập nhật số lượng trong giỏ hàng
app.put('/api/cart/:userId/update', async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  try {
    const user = await User.findOne({ id: userId });
    const product = await Product.findOne({ id: productId });

    if (!user || !product) {
      return res.status(404).json({ message: 'Người dùng hoặc sản phẩm không tồn tại' });
    }

    // Kiểm tra số lượng tồn kho
    if (quantity > product.quantity) {
      return res.status(400).json({ message: 'Số lượng vượt qu tn kho' });
    }

    const productInCart = user.cart.find(item => item.productId === productId);
    if (!productInCart) {
      return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
    }

    productInCart.quantity = quantity;

    await user.save();
    res.status(200).json({ message: 'Cập nhật số lượng thành công', cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật giỏ hàng', error: error.message });
  }
});

// Xóa sản phẩm khỏi giỏ hàng
app.delete('/api/cart/:userId/remove', async (req, res) => {
  const { userId } = req.params;
  const { productId } = req.body;

  try {
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    // Xóa sản phẩm khỏi giỏ hàng
    user.cart = user.cart.filter(item => item.productId !== productId);

    await user.save();
    res.status(200).json({ message: 'Sản phẩm đã được xóa khỏi giỏ hàng', cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng', error: error.message });
  }
});

// Lấy thông tin giỏ hàng của người dùng
app.get('/api/cart/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    res.status(200).json(user.cart);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin giỏ hàng', error: error.message });
  }
});

// API MOMO
app.post('/payment', async (req, res) => {
  try {
    const { amount, extraData, orderInfo } = req.body;

    // Kiểm tra và làm sạch dữ liệu
    const cleanAmount = parseInt(amount.toString().replace(/[^0-9]/g, ''), 10);
    
    // Kiểm tra số tiền hợp lệ
    if (cleanAmount < 1000 || cleanAmount > 50000000) {
      return res.status(400).json({
        message: 'Số tiền thanh toán phải từ 1,000 VND đến 50,000,000 VND'
      });
    }

    const orderId = config.partnerCode + new Date().getTime();
    const requestId = orderId;

    // Tạo chữ ký
    const rawSignature = `accessKey=${config.accessKey}&amount=${cleanAmount}&extraData=${extraData}&ipnUrl=${config.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${config.partnerCode}&redirectUrl=${config.redirectUrl}&requestId=${requestId}&requestType=${config.requestType}`;

    const signature = crypto
      .createHmac('sha256', config.secretKey)
      .update(rawSignature)
      .digest('hex');

    // Tạo body request
    const requestBody = {
      partnerCode: config.partnerCode,
      partnerName: "SphoneC",
      storeId: "MomoTestStore",
      requestId: requestId,
      amount: cleanAmount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: config.redirectUrl,
      ipnUrl: config.ipnUrl,
      lang: config.lang,
      requestType: config.requestType,
      autoCapture: true,
      extraData: extraData,
      signature: signature,
    };

    console.log('Sending request to MoMo:', requestBody);

    const response = await axios.post(
      'https://test-payment.momo.vn/v2/gateway/api/create',
      requestBody,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log('MoMo response:', response.data);

    res.json(response.data);
  } catch (error) {
    console.error('Error creating payment:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

// Thêm endpoint xử lý callback từ MoMo
app.post('/callback', async (req, res) => {
    console.log('Received callback request:', {
        body: req.body,
        headers: req.headers
    });

    const { resultCode, extraData, amount, orderId } = req.body;

    if (resultCode === 0) {
        try {
            // Kiểm tra xem đơn hàng đã tồn tại chưa
            const existingOrder = await Order.findOne({ momoOrderId: orderId });
            if (existingOrder) {
                console.log('Order already exists:', existingOrder);
                return res.status(200).json({ message: 'Order already processed' });
            }

            let orderData;
            try {
                orderData = JSON.parse(extraData);
                console.log('Parsed orderData:', orderData);
            } catch (error) {
                console.error('Error parsing extraData:', error);
                return res.status(400).json({ message: 'Invalid extraData format' });
            }

            // Validate orderData
            if (!orderData || !orderData.customerId || !orderData.items) {
                console.error('Invalid order data:', orderData);
                return res.status(400).json({ message: 'Missing required order data' });
            }

            // Tạo mã đơn hàng mới
            const counter = await Counter.findByIdAndUpdate(
                { _id: 'orderId' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            const newOrderId = `OD${String(counter.seq).padStart(3, '0')}`;

            // Tạo đơn hàng mới
            const order = new Order({
                id: newOrderId,
                customerId: orderData.customerId,
                customerName: orderData.customerName,
                shippingAddress: orderData.shippingAddress,
                items: orderData.items,
                totalAmount: amount,
                paymentMethod: 'MoMo',
                status: 'Đã thanh toán',
                paymentStatus: 'Đã thanh toán',
                orderDate: new Date(),
                notes: orderData.customerNote || '',
                discountId: orderData.discountId || null,
                momoOrderId: orderId // Lưu mã đơn hàng MoMo
            });

            console.log('Saving order with data:', order);
            await order.save();
            console.log('Order saved successfully');

            // Cập nhật số lượng sản phẩm
            await adjustProductStock(orderData.items);

            // Xóa sản phẩm khỏi giỏ hàng
            const user = await User.findOne({ id: orderData.customerId });
            if (user) {
                const productIds = orderData.items.map(item => item.productId);
                user.cart = user.cart.filter(item => !productIds.includes(item.productId));
                await user.save();
                console.log('Cart updated successfully');
            }

            return res.status(200).json({
                message: 'Order processed successfully',
                orderId: newOrderId
            });
        } catch (error) {
            console.error('Error processing order:', error);
            return res.status(500).json({ 
                message: 'Error processing order',
                error: error.message 
            });
        }
    } else {
        console.log('Payment failed with resultCode:', resultCode);
        return res.status(400).json({ message: 'Payment failed' });
    }
});


// Kiểm tra trạng thái giao dịch
app.post('/check-status-transaction', async (req, res) => {
  const { orderId } = req.body;

  const rawSignature = `accessKey=${config.accessKey}&orderId=${orderId}&partnerCode=${config.partnerCode}&requestId=${orderId}`;

  const signature = crypto.createHmac('sha256', config.secretKey).update(rawSignature).digest('hex');

  const requestBody = JSON.stringify({
    partnerCode: config.partnerCode,
    requestId: orderId,
    orderId: orderId,
    signature: signature,
    lang: config.lang,
  });

  try {
    const result = await axios.post('https://test-payment.momo.vn/v2/gateway/api/query', requestBody, {
      headers: { 'Content-Type': 'application/json' },
    });
    res.status(200).json(result.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Thêm endpoint để lấy thông tin một voucher
app.get('/api/discountCodes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const discountCode = await DiscountCode.findOne({ id: id });
        
        if (!discountCode) {
            return res.status(404).json({ 
                message: 'Không tìm thấy mã giảm giá' 
            });
        }
        res.json(discountCode);
    } catch (err) {
        console.error('Lỗi khi lấy thông tin mã giảm giá:', err);
        res.status(500).json({ 
            message: 'Lỗi khi lấy thông tin mã giảm giá', 
            error: err.message 
        });
    }
});

// Thêm các endpoints mới cho dashboard
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Lấy thời điểm đầu tháng này
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1); // Ngày đầu tiên của tháng này
    thisMonthStart.setHours(0, 0, 0, 0);

    // Lấy thời điểm đầu tháng trước
    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(thisMonthStart.getMonth() - 1); // Lùi về tháng trước

    // Lấy thời điểm tuần trước
    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    lastWeekStart.setHours(0, 0, 0, 0);

    // Lấy thời điểm hôm qua
    const yesterdayStart = new Date();
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);


    // Thống kê người dùng
    const totalUsers = await User.countDocuments() || 0;
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $lt: lastMonthStart }
    }) || 0;

    // Thống kê đơn hàng
    const totalOrders = await Order.countDocuments() || 0;
    const lastWeekOrders = await Order.countDocuments({
      orderDate: { $lt: lastWeekStart }
    }) || 0;

    // Đơn hàng đã thanh toán
    const pendingOrdersToday = await Order.countDocuments({
      status: 'Đã thanh toán'
    }) || 0;

    const pendingOrdersYesterday = await Order.countDocuments({
      status: 'Đã thanh toán',
      orderDate: { $lt: yesterdayStart }
    }) || 0;

    // Doanh thu tháng này và tháng trước
    const thisMonthRevenue = await Order.aggregate([
      {
        $match: {
          orderDate: { 
            $gte: thisMonthStart,
            $lt: new Date()
          },
          status: { $in: ['Đã thanh toán', 'Đã giao hàng'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    const lastMonthRevenue = await Order.aggregate([
      {
        $match: {
          orderDate: { 
            $gte: lastMonthStart,
            $lt: thisMonthStart
          },
          status: { $in: ['Đã thanh toán', 'Đã giao hàng'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    // Tính doanh thu theo tháng cho năm hiện tại
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          orderDate: {
            $gte: new Date(new Date().getFullYear(), 0, 1),
            $lt: new Date(new Date().getFullYear() + 1, 0, 1)
          },
          status: { $in: ['Đã thanh toán', 'Đã giao hàng'] }
        }
      },
      {
        $group: {
          _id: { $month: "$orderDate" },
          total: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Đảm bảo có đủ 12 tháng với giá trị mặc định là 0
    const fullMonthlyRevenue = Array.from({ length: 12 }, (_, index) => {
      const monthData = monthlyRevenue.find(item => item._id === index + 1);
      return {
        _id: index + 1,
        total: monthData ? monthData.total : 0
      };
    });

    // Trích xuất giá trị total từ kết quả aggregate
    const thisMonthTotal = thisMonthRevenue[0]?.total || 0;
    const lastMonthTotal = lastMonthRevenue[0]?.total || 0;

    // Tính phần trăm thay đổi
    const userChange = lastMonthUsers === 0 ? 0 :
      ((totalUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1);
    
    const orderChange = lastWeekOrders === 0 ? 0 :
      ((totalOrders - lastWeekOrders) / lastWeekOrders * 100).toFixed(1);
    
    const pendingOrderChange = pendingOrdersYesterday === 0 ? 0 :
      ((pendingOrdersToday - pendingOrdersYesterday) / pendingOrdersYesterday * 100).toFixed(1);
    
    const revenueChange = lastMonthTotal === 0 ? 0 :
      ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1);

    // Lấy 5 đơn hàng gần nhất
    const recentOrders = await Order.find()
      .sort({ orderDate: -1 })
      .limit(5);

    res.json({
      stats: {
        users: {
          total: totalUsers,
          change: parseFloat(userChange)
        },
        orders: {
          total: totalOrders,
          change: parseFloat(orderChange)
        },
        revenue: {
          total: thisMonthTotal,
          change: parseFloat(revenueChange)
        },
        pendingOrders: {
          total: pendingOrdersToday,
          change: parseFloat(pendingOrderChange)
        }
      },
      monthlyRevenue: fullMonthlyRevenue,
      recentOrders
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      message: 'Lỗi khi lấy thống kê', 
      error: error.message 
    });
  }
});

// Hủy đơn hàng
app.post('/api/orders/:id/cancel', async (req, res) => {
  const { id } = req.params;
  const { cancellationReason } = req.body;

  try {
    const order = await Order.findOne({ id });
    
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Kiểm tra xem đơn hàng có thể hủy không
    if (['Đang giao hàng', 'Đã giao hàng', 'Đã hủy'].includes(order.status)) {
      return res.status(400).json({ 
        message: 'Không thể hủy đơn hàng trong trạng thái này' 
      });
    }

    if (!cancellationReason) {
      return res.status(400).json({ 
        message: 'Vui lòng cung cấp lý do hủy đơn hàng' 
      });
    }

    // Cập nhật trạng thái đơn hàng
    order.status = 'Đã hủy';
    order.cancellationReason = cancellationReason;
    order.cancelledAt = new Date();

    // Hoàn lại số lượng sản phẩm vào kho
    await adjustProductStock(order.items, true);

    await order.save();

    res.json({ 
      message: 'Đơn hàng đã được hủy thành công', 
      order 
    });
  } catch (err) {
    console.error('Lỗi khi hủy đơn hàng:', err);
    res.status(500).json({ 
      message: 'Lỗi khi hủy đơn hàng', 
      error: err.message 
    });
  }
});

// Xóa nhiều sản phẩm khỏi giỏ hàng
app.delete('/api/cart/:userId/removeMultiple', async (req, res) => {
  const { userId } = req.params;
  const { productIds } = req.body;

  try {
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    // Xóa các sản phẩm được chọn khỏi giỏ hàng
    user.cart = user.cart.filter(item => !productIds.includes(item.productId));

    await user.save();
    res.status(200).json({ 
      message: 'Các sản phẩm đã được xóa khỏi giỏ hàng', 
      cart: user.cart 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng', 
      error: error.message 
    });
  }
});

// API tạo đơn hàng cho thanh toán tiền mặt
app.post('/api/orders/create', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Tạo ID cho đơn hàng mới
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'orderId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const newOrderId = `OD${String(counter.seq).padStart(3, '0')}`;

    // Tạo đơn hàng mới
    const newOrder = new Order({
      id: newOrderId,
      ...orderData,
      status: 'Chờ xác nhận',
      orderDate: new Date(),
    });

    await newOrder.save();
    await adjustProductStock(orderData.items);

    // Xóa các sản phẩm đã đặt hàng khỏi giỏ hàng
    const user = await User.findOne({ id: orderData.customerId });
    if (user) {
      const orderedProductIds = orderData.items.map(item => item.productId);
      user.cart = user.cart.filter(cartItem => 
        !orderedProductIds.includes(cartItem.productId)
      );
      await user.save();
    }

    res.status(201).json({ 
      message: 'Đơn hàng đã được tạo thành công', 
      order: newOrder 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      message: 'Lỗi khi tạo đơn hàng', 
      error: error.message 
    });
  }
});

// Thêm các endpoints mới cho doanh thu theo ngày và tuần
app.get('/api/dashboard/revenue/daily', async (req, res) => {
  try {
    // Lấy doanh thu 7 ngày gần nhất
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: sevenDaysAgo },
          status: { $in: ['Đã thanh toán', 'Đã giao hàng'] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
          total: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(dailyRevenue);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy doanh thu theo ngày', error: error.message });
  }
});

app.get('/api/dashboard/revenue/weekly', async (req, res) => {
  try {
    // Lấy doanh thu 4 tuần gần nhất
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    fourWeeksAgo.setHours(0, 0, 0, 0);

    const weeklyRevenue = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: fourWeeksAgo },
          status: { $in: ['Đã thanh toán', 'Đã giao hàng'] }
        }
      },
      {
        $group: {
          _id: { $week: "$orderDate" },
          total: { $sum: "$totalAmount" },
          startDate: { $min: "$orderDate" }
        }
      },
      { $sort: { startDate: 1 } }
    ]);

    res.json(weeklyRevenue);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy doanh thu theo tuần', error: error.message });
  }
});

// Thêm endpoint mới để kiểm tra sản phẩm có đang được sử dụng
app.get('/api/products/:id/check-usage', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Kiểm tra trong đơn hàng
    const orderWithProduct = await Order.findOne({
      'items.productId': id
    });

    // Kiểm tra trong phiếu kho
    const khoWithProduct = await Kho.findOne({
      'products.productId': id
    });

    const isInUse = !!(orderWithProduct || khoWithProduct);
    
    res.json({
      isInUse,
      inOrders: !!orderWithProduct,
      inKho: !!khoWithProduct
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Lỗi khi kiểm tra sử dụng sản phẩm', 
      error: err.message 
    });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

