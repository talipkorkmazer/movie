/*
  Warnings:

  - A unique constraint covering the columns `[movieId,date,timeSlot,roomNumber]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Session_movieId_date_timeSlot_roomNumber_key` ON `Session`(`movieId`, `date`, `timeSlot`, `roomNumber`);
