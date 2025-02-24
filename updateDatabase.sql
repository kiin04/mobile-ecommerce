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
