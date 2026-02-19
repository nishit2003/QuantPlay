-- AlterTable TradeTransaction: add orderMode and orderType (schema had them, migration was missing)
ALTER TABLE `TradeTransaction` ADD COLUMN `orderMode` ENUM('SHARES', 'DOLLARS') NOT NULL DEFAULT 'SHARES';
ALTER TABLE `TradeTransaction` ADD COLUMN `orderType` ENUM('MARKET', 'LIMIT', 'STOP_LOSS') NOT NULL DEFAULT 'MARKET';
