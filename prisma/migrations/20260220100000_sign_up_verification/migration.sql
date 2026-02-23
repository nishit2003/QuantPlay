-- CreateTable SignUpVerification (pending sign-up until OTP verified)
CREATE TABLE `SignUpVerification` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `hashedPassword` TEXT NOT NULL,
    `referredById` VARCHAR(191) NULL,
    `referralCode` VARCHAR(191) NOT NULL,
    `otp` VARCHAR(6) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `SignUpVerification_email_key`(`email`),
    INDEX `SignUpVerification_email_idx`(`email`),
    INDEX `SignUpVerification_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
