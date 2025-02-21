alter table Products
add promo int;
GO
UPDATE Products
SET promo = 0;
GO
UPDATE Accounts
SET password = '$2a$11$DtH80CwOQ5BiwisbC7g9eOEmBeIHWm4Wzw533d8k.nytLF87vo27a';
GO

alter table ColorSize add code NVARCHAR(50) 