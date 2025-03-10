-- insert
USE DBShop
GO
-- Thêm dữ liệu vào bảng Categories
INSERT INTO Categories (name, description) VALUES
(N'iPhone', N'Các dòng iPhone mới nhất của Apple'),
(N'MacBook', N'Các dòng MacBook Air và MacBook Pro'),
(N'iPad', N'Các dòng iPad từ Mini đến Pro'),
(N'AirPods', N'Tai nghe không dây cao cấp của Apple'),
(N'Watch', N'Apple Watch các phiên bản'),
(N'Phụ kiện', N'Các phụ kiện hỗ trợ Apple devices');
GO
-- Thêm dữ liệu vào bảng Products
INSERT INTO Products (name, description, price, unit, category_id, sold, rate,  start_rate) VALUES
(N'iPhone 19 Pro Max', N'Flagship mới nhất của Apple', 33990000, N'Cái', 1,0,0,0),
(N'iPhone 14 Pro', N'Phiên bản Pro với camera 48MP', 27990000, N'Cái', 1,0,0,0),
(N'iPhone 13', N'Hiệu suất mạnh mẽ với giá hợp lý', 18990000, N'Cái', 1,0,0,0),
(N'MacBook Air M2', N'Mỏng nhẹ, chip M2 mạnh mẽ', 27990000, N'Cái', 2,0,0,0),
(N'MacBook Pro 14 M3', N'Sức mạnh đỉnh cao cho công việc sáng tạo', 49990000, N'Cái', 2,0,0,0),
(N'iPad Pro M2 12.9', N'Màn hình lớn, hỗ trợ Apple Pencil', 31990000, N'Cái', 3,0,0,0),
(N'iPad Air M1', N'Chip M1 mạnh mẽ, thiết kế mỏng nhẹ', 18990000, N'Cái', 3,0,0,0),
(N'AirPods Pro 2', N'Tai nghe chống ồn chủ động', 5890000, N'Cái', 4,0,0,0),
(N'Apple Watch Series 9', N'Màn hình Always-On, chip S9', 12990000, N'Cái', 5,0,0,0),
(N'Cáp sạc MagSafe', N'Cáp sạc không dây cho iPhone', 1290000, N'Cái', 6,0,0,0);
GO
Update Products set brand ='Apple';
GO
Update Products set promo =10;
GO


-- Thêm dữ liệu vào bảng ColorSize
INSERT INTO ColorSize (product_id, color, size, quantity,code) VALUES
(1, N'Đen Titan', N'128GB', 50,'#000000'),
(1, N'Trắng Titan', N'256GB', 30,'#000000'),
(2, N'Tím', N'512GB', 20,'#000000'),
(3, N'Xanh Lá', N'128GB', 40,'#000000'),
(4, N'Bạc', N'256GB', 25,'#000000'),
(5, N'Xám', N'512GB', 15,'#000000'),
(6, N'Xám', N'1TB', 10,'#000000'),
(7, N'Hồng', N'256GB', 35,'#000000'),
(8, N'Trắng', N'None', 50,'#000000'),
(9, N'Đỏ', N'45mm', 20,'#000000');
GO
Update  ColorSize set price = 0;
GO
-- Thêm dữ liệu vào bảng Users
INSERT INTO Users (name, account, phone, address, role) VALUES
(N'Nguyễn Tùng Lâm', 1, '0987654321', N'TP.HCM', 2),
(N'Cao Xuân Quang', 2, '0912345678', N'TP.HCM', 4),
(N'Đoàn Hữu Nghĩa', 3, '0905123456', N'Đà Nẵng', 4),
(N'Nguyễn Ngọc Kim Sơn', 4, '0922334455', N'Hải Phòng', 4),
(N'Huỳnh Minh Quân', 5, '0988997776', N'Cần Thơ', 4);

-- Thêm dữ liệu vào bảng Roles
INSERT INTO Roles (name, promo) VALUES
(N'Khách vãng lai', 0),
(N'Admin', 0),
(N'Nhân viên', 5),
(N'Khách hàng thường', 0),
(N'Khách hàng Bạc', 7),
(N'Khách hàng Vàng', 10),
(N'Khách hàng Kim Cương', 15);

-- Thêm dữ liệu vào bảng Accounts
INSERT INTO Accounts (user_id, email, password) VALUES
(1, 'lamnt108@gmail.com', '123456'),
(2, 'qcao@gmail.com', 'abcdef'),
(3, 'dnghia@gmail.com', 'qwerty'),
(4, 'nsong@gmail.com', '123123'),
(5, 'minhquan@gmail.com', '456456');


-- Thêm dữ liệu vào bảng Orders
INSERT INTO Orders (user_id, total_price, status, phone, address, paymentMethod, paymentStatus) VALUES
(1, 35990000, N'Đã giao hàng', '0987654321', N'TP.HCM', N'Tiền mặt',''),
(2, 27990000, N'Đang xử lý', '0912345678', N'TP.HCM', N'Tiền mặt',''),
(3, 19990000, N'Chờ xác nhận', '0905123456', N'Đà Nẵng', N'Tiền mặt',''),
(4, 5890000, N'Đã hủy', '0922334455', N'Hải Phòng', N'Tiền mặt',''),
(5, 12990000, N'Đang vận chuyển', '0988997776', N'Cần Thơ', N'Tiền mặt','');

-- Thêm dữ liệu vào bảng OrderDetails
INSERT INTO OrderDetails (order_id, color_size_id, quantity, price, productId) VALUES
(1, 1, 1, 33990000, 1),
(2, 2, 1, 27990000, 1),
(3, 3, 1, 18990000, 2),
(4, 4, 2, 9990000, 3),
(5, 5, 1, 12990000, 4);

-- Thêm dữ liệu vào bảng Cart

INSERT INTO Cart (product_id,color_size_id, quantity, user_id, price) VALUES
(1,1, 1, 2, 33990000),
(2,3, 2, 3, 33980000);

-- Thêm dữ liệu vào bảng Details
INSERT INTO Details
(ScreenSize, ScreenTechnology, RearCamera, FrontCamera, Chipset, GPU, NFC, RAM, InternalStorage, Battery, SIMCard, ScreenResolution, ChargingTechnology, ProductId)
VALUES
(N'6.7 inch', N'OLED', N'48MP', N'12MP', N'A17 Pro', N'Apple GPU', 'Có', N'8GB', N'256GB', N'4500mAh', N'Nano SIM + eSIM', N'2796x1290', N'Fast Charging', 1),
(N'14 inch', N'Mini-LED', NULL, NULL, N'Apple M3', N'Apple GPU', 'Không', N'16GB', N'512GB', NULL, NULL, N'3024x1964', N'Fast Charging', 2);

-- Thêm dữ liệu vào bảng Promotion
INSERT INTO Promotion (name, value, end_at, code, minPrice) VALUES
(N'Giảm giá Tết', 10, '2025-02-28','VCNEWYEAR',20000000),
(N'Mừng Sinh Nhật Apple', 15, '2025-03-15','APPLEBIRTH',20000000),
(N'Sale Back To School', 5, '2025-08-31','GOSCHOOL',20000000),
(N'Khuyến mãi Black Friday', 20, '2025-11-30','BACLK6DAYS',20000000),
(N'Giảm giá VIP Member', 12, '2025-12-31','VIPMEMBER',20000000);

-- Thêm dữ liệu vào bảng Comments
INSERT INTO Comments (userID, product_id, name, content , stars) VALUES
(1, 1, N'Nguyễn Tùng Lâm', N'Sản phẩm này thật tuyệt vời!',  5),
(2, 2, N'Cao Xuân Quang', N'Chất lượng sản phẩm rất tốt.',  4),
(5, 3, N'Huỳnh Minh Quân', N'Dịch vụ khách hàng rất chu đáo.', 3);
