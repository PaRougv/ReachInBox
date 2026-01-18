-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'LOCAL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "provider" "AuthProvider" NOT NULL DEFAULT 'GOOGLE',
ALTER COLUMN "googleId" DROP NOT NULL;
