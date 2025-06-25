/*
  Warnings:

  - You are about to drop the column `reason` on the `TokenTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `TokenTransaction` table. All the data in the column will be lost.
  - Added the required column `description` to the `TokenTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TokenTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "model" TEXT,
    "description" TEXT NOT NULL,
    "stripePaymentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TokenTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TokenTransaction" ("amount", "id", "type", "userId") SELECT "amount", "id", "type", "userId" FROM "TokenTransaction";
DROP TABLE "TokenTransaction";
ALTER TABLE "new_TokenTransaction" RENAME TO "TokenTransaction";
CREATE INDEX "TokenTransaction_userId_idx" ON "TokenTransaction"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
