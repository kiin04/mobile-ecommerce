
CREATE DATABASE DBShop
GO 
USE DBShop
GO
-- Bảng Categories
CREATE TABLE
    Categories (
        id INT PRIMARY KEY IDENTITY (1, 1),
        name NVARCHAR (255) NOT NULL,
        description NVARCHAR (MAX),
        image VARBINARY(MAX),
        created_at DATETIME DEFAULT GETDATE (),
        updated_at DATETIME DEFAULT GETDATE ()
    );

-- Bảng Products
CREATE TABLE
    Products (
        id INT PRIMARY KEY IDENTITY (1, 1),
        name NVARCHAR (255) NOT NULL,
        description NVARCHAR (MAX),
        price DECIMAL(18, 2) NOT NULL,
        promo int,
        unit NVARCHAR (50),
        brand NVARCHAR (50),
        sold INT default 0,
        rate INT default 0,
		start_rate INT default 0,
        image VARBINARY(MAX),
        category_id INT NOT NULL,
        created_at DATETIME DEFAULT GETDATE (),
        updated_at DATETIME DEFAULT GETDATE (),
        FOREIGN KEY (category_id) REFERENCES Categories (id)
);

-- Bảng ColorSize
CREATE TABLE
    ColorSize (
        id INT PRIMARY KEY IDENTITY (1, 1),
        product_id INT NOT NULL,
        color NVARCHAR (50) NOT NULL,
		code NVARCHAR (50) NOT NULL,
        size NVARCHAR (10) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(18, 2),
        FOREIGN KEY (product_id) REFERENCES Products (id),
        created_at DATETIME DEFAULT GETDATE (),
        updated_at DATETIME DEFAULT GETDATE ()
    );

-- Bảng Users
CREATE TABLE
    Users (
        id INT PRIMARY KEY IDENTITY (1, 1),
        name NVARCHAR (255) NOT NULL,
        account INT,
        phone NVARCHAR (15),
        address NVARCHAR (255),
        created_at DATETIME DEFAULT GETDATE (),
        updated_at DATETIME DEFAULT GETDATE (),
        image VARBINARY(MAX),
        role INT,
        total_buy DECIMAL(18, 2) DEFAULT 0
    );

-- Bảng Roles
CREATE TABLE
    Roles (
        id INT PRIMARY KEY IDENTITY (1, 1),
        name NVARCHAR (255) NOT NULL,
        promo INT,
        created_at DATETIME DEFAULT GETDATE (),
        updated_at DATETIME DEFAULT GETDATE (),
    );

-- Bảng Account
CREATE TABLE
    Accounts (
        id INT PRIMARY KEY IDENTITY (1, 1),
        user_id INT,
        email NVARCHAR (255) NOT NULL UNIQUE,
        password NVARCHAR (255) NOT NULL,
        created_at DATETIME DEFAULT GETDATE (),
        updated_at DATETIME DEFAULT GETDATE (),
    );

-- Bảng Orders
CREATE TABLE
    Orders (
        id INT PRIMARY KEY IDENTITY (1, 1),
        user_id INT NULL,
        total_price DECIMAL(18, 2) NOT NULL,
        status NVARCHAR (50) DEFAULT 'Chờ xác nhận',
        created_at DATETIME DEFAULT GETDATE (),
        updated_at DATETIME DEFAULT GETDATE (),
        name NVARCHAR (255) NULL,
        phone NVARCHAR (15) NULL,
        address NVARCHAR (255) NULL,
		paymentStatus NVARCHAR(70) NUll,
		paymentMethod NVARCHAR(70) NUll,
		cancellationReason NVARCHAR(255) NUll,
		note NVARCHAR(MAX) NUll
    );

-- Bảng OrderDetails
CREATE TABLE
    OrderDetails (
        id INT PRIMARY KEY IDENTITY (1, 1),
        order_id INT NOT NULL,
        color_size_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(18, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES Orders (id),
        FOREIGN KEY (color_size_id) REFERENCES ColorSize (id),
        productId INT,
        created_at DATETIME DEFAULT GETDATE (),
        updated_at DATETIME DEFAULT GETDATE ()
    );

CREATE TABLE
    Cart (
        id INT PRIMARY KEY IDENTITY (1, 1),
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        user_id INT,
        color_size_id INT,
        price DECIMAL(18, 2) NOT NULL,
        FOREIGN KEY (product_id) REFERENCES Products (id),
        FOREIGN KEY (user_id) REFERENCES Users (id),
        created_at DATETIME DEFAULT GETDATE (),
        updated_at DATETIME DEFAULT GETDATE ()
    );

--Bang Details
CREATE TABLE
    Details (
        id INT IDENTITY (1, 1) PRIMARY KEY,
        ScreenSize NVARCHAR (50) NULL, -- Screen size
        ScreenTechnology NVARCHAR (100) NULL, -- Screen technology
        RearCamera NVARCHAR (100) NULL, -- Rear camera
        FrontCamera NVARCHAR (100) NULL, -- Front camera
        Chipset NVARCHAR (100) NULL, -- Chipset
        GPU NVARCHAR (100) NULL, -- GPU
        NFC NVARCHAR (10) NULL, -- NFC technology
        RAM NVARCHAR (50) NULL, -- RAM capacity
        InternalStorage NVARCHAR (50) NULL, -- Internal storage
        Battery NVARCHAR (50) NULL, -- Battery capacity
        SIMCard NVARCHAR (50) NULL, -- SIM card type
        ScreenResolution NVARCHAR (100) NULL, -- Screen resolution
        ChargingTechnology NVARCHAR (50) NULL, -- Charging technology
        ProductId INT, -- Foreign key to the Products table
        FOREIGN KEY (ProductId) REFERENCES Products (id),
		created_at DATETIME DEFAULT GETDATE (),
        updated_at DATETIME DEFAULT GETDATE ()
    );

-- Bảng Promotion
CREATE TABLE
    Promotion (
        id INT PRIMARY KEY IDENTITY (1, 1),
        name NVARCHAR (255) NOT NULL,
        value DECIMAL(18, 2) NOT NULL,
		minPrice DECIMAL(18, 2) NOT NULL,
		code NVARCHAR (20) NOT NULL,
        created_at DATETIME DEFAULT GETDATE (),
        updated_at DATETIME DEFAULT GETDATE (),
        end_at DATETIME
);

create table Comments(
	id INT PRIMARY KEY IDENTITY(1,1),
    userID int NOT NULL,
	product_id INT,
    name NVARCHAR(255),
	stars INT ,
	created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
	content NVARCHAR(250) 
);


