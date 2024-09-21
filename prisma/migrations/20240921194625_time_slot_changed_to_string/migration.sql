/*
  Warnings:

  - You are about to alter the column `timeSlot` on the `Session` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(191)`.
  - A unique constraint covering the columns `[name]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Session` MODIFY `timeSlot` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Movie_name_key` ON `Movie`(`name`);
