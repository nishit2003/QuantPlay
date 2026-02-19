-- AlterTable User: add starting balance and referral fields
ALTER TABLE `User` ADD COLUMN `startingVirtualCashBalance` DECIMAL(12, 2) NOT NULL DEFAULT 1000.00;
ALTER TABLE `User` ADD COLUMN `referralCode` VARCHAR(191) NULL;
ALTER TABLE `User` ADD COLUMN `referredById` VARCHAR(191) NULL;

-- Backfill starting balance for existing users (use current balance as their "start")
UPDATE `User` SET `startingVirtualCashBalance` = `virtualCashBalance`;

-- Unique index for referral codes
CREATE UNIQUE INDEX `User_referralCode_key` ON `User`(`referralCode`);

-- Foreign key for referral
ALTER TABLE `User` ADD CONSTRAINT `User_referredById_fkey` FOREIGN KEY (`referredById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable PriceAlert
CREATE TABLE `PriceAlert` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tickerSymbol` VARCHAR(10) NOT NULL,
    `targetPrice` DECIMAL(12, 2) NOT NULL,
    `direction` VARCHAR(10) NOT NULL,
    `triggered` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PriceAlert_userId_idx`(`userId`),
    INDEX `PriceAlert_triggered_idx`(`triggered`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `PriceAlert` ADD CONSTRAINT `PriceAlert_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable PortfolioSnapshot
CREATE TABLE `PortfolioSnapshot` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `value` DECIMAL(14, 2) NOT NULL,

    UNIQUE INDEX `PortfolioSnapshot_userId_date_key`(`userId`, `date`),
    INDEX `PortfolioSnapshot_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `PortfolioSnapshot` ADD CONSTRAINT `PortfolioSnapshot_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
