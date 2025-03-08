alter table Products
add promo int;
GO
UPDATE Products
SET promo = 0;
GO
UPDATE Accounts
SET password = '$2a$11$DtH80CwOQ5BiwisbC7g9eOEmBeIHWm4Wzw533d8k.nytLF87vo27a';
GO


-- updaet 24/02/2024
alter table Orders
add paymentStatus NVARCHAR(70) NUll;
GO
alter table Orders
add paymentMethod NVARCHAR(70) NUll;
GO
alter table Orders
add cancellationReason NVARCHAR(255) NUll;
GO
ALTER TABLE [Users]
ALTER COLUMN [account] int NULL;
GO
ALTER TABLE [Users]
ALTER COLUMN address NVARCHAR(255) NULL;
GO
ALTER TABLE [Users]
ALTER COLUMN image VARBINARY(MAX) NULL;
GO

-- update 03/03/2025
alter table Products
add start_rate INT NULL;
GO

create table Comments(
	id INT PRIMARY KEY IDENTITY(1,1),
    userID NVARCHAR(255) NOT NULL,
    name NVARCHAR(255),
	start  INT NULL,
	product_id  INT ,
	created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);


-- update 04/03/2025
alter table Promotion
add code VARCHAR(10) NULL;
GO

alter table Promotion
add minPrice  DECIMAL(18, 2) NULL;
GO

alter table colorSizes
add code VARCHAR(10);
GO

Update  ColorSizes
set code = '#000000';
GO

-- update 06/03/2025
update Products set start_rate = 0

-- update 09/03/2025
ALTER TABLE Comments
ADD rating INT NULL;
EXEC sp_rename 'Comments.start', 'content', 'COLUMN';