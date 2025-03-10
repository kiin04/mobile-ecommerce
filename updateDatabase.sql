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

-- update-2 09/03/2025
CREATE TABLE Comments(
    id INT PRIMARY KEY IDENTITY(1,1),
    userID INT NOT NULL,
    product_id INT NOT NULL,
    name NVARCHAR(255),
    stars DECIMAL(2,1) NOT NULL,
    content NVARCHAR(250) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userID) REFERENCES Users(id),
    FOREIGN KEY (product_id) REFERENCES Products(id)
);

-- update-3 09/03/2025
alter table  Users
add DateofBirth DATE NULL;

alter table Accounts
add username NVARCHAR(20);

-- update 09/03/2025
alter table Orders  add note NVARCHAR(MAX) NULL;

-- update 10/03/2025
UPDATE Users
SET DateofBirth = '2004-06-20';

UPDATE Accounts
SET username = CASE
    WHEN id = 1 THEN 'lamnt108'
    WHEN id = 2 THEN 'qcao'
    WHEN id = 3 THEN 'dnghia'
    WHEN id = 4 THEN 'nsong'
    WHEN id = 5 THEN 'minhquan'
    ELSE username
END
WHERE id IN (1, 2, 3, 4, 5);

-- update-2 10/03/2025
alter table Comments
alter column stars float