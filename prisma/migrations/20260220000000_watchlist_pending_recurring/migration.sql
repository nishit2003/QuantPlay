-- CreateTable Watchlist
CREATE TABLE `Watchlist` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Watchlist_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable WatchlistItem
CREATE TABLE `WatchlistItem` (
    `id` VARCHAR(191) NOT NULL,
    `watchlistId` VARCHAR(191) NOT NULL,
    `tickerSymbol` VARCHAR(10) NOT NULL,
    `addedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `WatchlistItem_watchlistId_tickerSymbol_key`(`watchlistId`, `tickerSymbol`),
    INDEX `WatchlistItem_watchlistId_idx`(`watchlistId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable PendingOrder
CREATE TABLE `PendingOrder` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tickerSymbol` VARCHAR(10) NOT NULL,
    `type` ENUM('BUY', 'SELL') NOT NULL,
    `orderType` ENUM('MARKET', 'LIMIT', 'STOP_LOSS') NOT NULL,
    `targetPrice` DECIMAL(12, 2) NOT NULL,
    `quantity` DECIMAL(16, 8) NULL,
    `dollarAmount` DECIMAL(12, 2) NULL,
    `orderMode` ENUM('SHARES', 'DOLLARS') NOT NULL DEFAULT 'SHARES',
    `status` ENUM('PENDING', 'EXECUTED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NULL,

    INDEX `PendingOrder_userId_idx`(`userId`),
    INDEX `PendingOrder_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable RecurringOrder
CREATE TABLE `RecurringOrder` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tickerSymbol` VARCHAR(10) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `frequency` ENUM('DAILY', 'WEEKLY', 'MONTHLY') NOT NULL,
    `nextRunAt` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RecurringOrder_userId_idx`(`userId`),
    INDEX `RecurringOrder_active_nextRunAt_idx`(`active`, `nextRunAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Watchlist` ADD CONSTRAINT `Watchlist_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WatchlistItem` ADD CONSTRAINT `WatchlistItem_watchlistId_fkey` FOREIGN KEY (`watchlistId`) REFERENCES `Watchlist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PendingOrder` ADD CONSTRAINT `PendingOrder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecurringOrder` ADD CONSTRAINT `RecurringOrder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
