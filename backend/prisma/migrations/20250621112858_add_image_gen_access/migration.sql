-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserBilling" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'free',
    "availableTokens" INTEGER NOT NULL DEFAULT 10000,
    "tokenSource" TEXT NOT NULL DEFAULT 'free_monthly',
    "lastTokenResetDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripeCustomerId" TEXT,
    "hasAccessToImageGen" BOOLEAN NOT NULL DEFAULT false,
    "totalAmountSpent" REAL NOT NULL DEFAULT 0,
    "totalTokensUsedJson" TEXT NOT NULL,
    "freeTokensRemainingJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserBilling_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserBilling" ("availableTokens", "createdAt", "freeTokensRemainingJson", "id", "lastTokenResetDate", "stripeCustomerId", "subscriptionStatus", "tokenSource", "totalTokensUsedJson", "updatedAt", "userId") SELECT "availableTokens", "createdAt", "freeTokensRemainingJson", "id", "lastTokenResetDate", "stripeCustomerId", "subscriptionStatus", "tokenSource", "totalTokensUsedJson", "updatedAt", "userId" FROM "UserBilling";
DROP TABLE "UserBilling";
ALTER TABLE "new_UserBilling" RENAME TO "UserBilling";
CREATE UNIQUE INDEX "UserBilling_userId_key" ON "UserBilling"("userId");
CREATE INDEX "UserBilling_userId_idx" ON "UserBilling"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
