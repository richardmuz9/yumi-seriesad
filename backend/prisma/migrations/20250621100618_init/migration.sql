-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserBilling" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'free',
    "availableTokens" INTEGER NOT NULL DEFAULT 10000,
    "tokenSource" TEXT NOT NULL DEFAULT 'free_monthly',
    "lastTokenResetDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalTokensUsedJson" TEXT NOT NULL,
    "freeTokensRemainingJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserBilling_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "writingStyle" TEXT NOT NULL DEFAULT 'professional',
    "seoPreferencesJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIUsageAnalytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL,
    "requestType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "metadataJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIUsageAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "readability" REAL,
    "sentiment" TEXT,
    "keywordsJson" TEXT NOT NULL,
    "suggestionsJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContentAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestPrompt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "readingPassage" TEXT,
    "listeningTranscript" TEXT,
    "question" TEXT NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "wordLimit" INTEGER NOT NULL,
    "sampleAnswer" TEXT,
    "rubric" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TestSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "essay" TEXT NOT NULL,
    "overallScore" REAL NOT NULL,
    "feedbackReportJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TestSubmission_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "TestPrompt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TestSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Citation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authorsJson" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "doi" TEXT,
    "url" TEXT,
    "citationStyle" TEXT NOT NULL DEFAULT 'apa',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Citation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Equation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "latex" TEXT NOT NULL,
    "displayMode" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "number" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Equation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Figure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "caption" TEXT,
    "source" TEXT,
    "dataJson" TEXT,
    "configJson" TEXT,
    "format" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Figure_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserBilling_userId_key" ON "UserBilling"("userId");

-- CreateIndex
CREATE INDEX "UserBilling_userId_idx" ON "UserBilling"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- CreateIndex
CREATE INDEX "UserPreferences_userId_idx" ON "UserPreferences"("userId");

-- CreateIndex
CREATE INDEX "AIUsageAnalytics_userId_idx" ON "AIUsageAnalytics"("userId");

-- CreateIndex
CREATE INDEX "ContentAnalysis_userId_idx" ON "ContentAnalysis"("userId");

-- CreateIndex
CREATE INDEX "TestSubmission_promptId_idx" ON "TestSubmission"("promptId");

-- CreateIndex
CREATE INDEX "TestSubmission_userId_idx" ON "TestSubmission"("userId");

-- CreateIndex
CREATE INDEX "Citation_userId_idx" ON "Citation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Citation_id_userId_key" ON "Citation"("id", "userId");

-- CreateIndex
CREATE INDEX "Equation_userId_idx" ON "Equation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Equation_id_userId_key" ON "Equation"("id", "userId");

-- CreateIndex
CREATE INDEX "Figure_userId_idx" ON "Figure"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Figure_id_userId_key" ON "Figure"("id", "userId");
