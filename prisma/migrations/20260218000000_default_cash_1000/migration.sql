-- AlterTable: set default starting virtual cash to 1000 for new users
ALTER TABLE `User` MODIFY COLUMN `virtualCashBalance` DECIMAL(12, 2) NOT NULL DEFAULT 1000.00;
