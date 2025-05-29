/*
  Warnings:

  - Added the required column `registrationEndDate` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "registrationEndDate" TIMESTAMP(3) NOT NULL;
