-- CreateTable
CREATE TABLE "ArtworkContribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rewardClaimed" BOOLEAN NOT NULL DEFAULT false,
    "rewardAmount" INTEGER NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ArtworkContribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContributionReward" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "contributionId" TEXT NOT NULL,
    "timeshardsAwarded" INTEGER NOT NULL,
    "awardedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContributionReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ContributionReward_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "ArtworkContribution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
    "contributionRewards" INTEGER NOT NULL DEFAULT 0,
    "artworkContributions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserBilling_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserBilling" ("availableTokens", "createdAt", "freeTokensRemainingJson", "hasAccessToImageGen", "id", "lastTokenResetDate", "stripeCustomerId", "subscriptionStatus", "tokenSource", "totalAmountSpent", "totalTokensUsedJson", "updatedAt", "userId") SELECT "availableTokens", "createdAt", "freeTokensRemainingJson", "hasAccessToImageGen", "id", "lastTokenResetDate", "stripeCustomerId", "subscriptionStatus", "tokenSource", "totalAmountSpent", "totalTokensUsedJson", "updatedAt", "userId" FROM "UserBilling";
DROP TABLE "UserBilling";
ALTER TABLE "new_UserBilling" RENAME TO "UserBilling";
CREATE UNIQUE INDEX "UserBilling_userId_key" ON "UserBilling"("userId");
CREATE INDEX "UserBilling_userId_idx" ON "UserBilling"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ArtworkContribution_userId_idx" ON "ArtworkContribution"("userId");

-- CreateIndex
CREATE INDEX "ArtworkContribution_status_idx" ON "ArtworkContribution"("status");

-- CreateIndex
CREATE INDEX "ContributionReward_userId_idx" ON "ContributionReward"("userId");

-- CreateIndex
CREATE INDEX "ContributionReward_contributionId_idx" ON "ContributionReward"("contributionId");
