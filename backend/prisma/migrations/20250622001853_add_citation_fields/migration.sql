/*
  Warnings:

  - Added the required column `bibliography` to the `Citation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bibtex` to the `Citation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inTextCitation` to the `Citation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `Citation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Citation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Citation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authorsJson" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "doi" TEXT,
    "url" TEXT,
    "citationStyle" TEXT NOT NULL DEFAULT 'apa',
    "bibtex" TEXT NOT NULL,
    "inTextCitation" TEXT NOT NULL,
    "bibliography" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Citation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Citation" ("authorsJson", "citationStyle", "createdAt", "doi", "id", "title", "updatedAt", "url", "userId", "year") SELECT "authorsJson", "citationStyle", "createdAt", "doi", "id", "title", "updatedAt", "url", "userId", "year" FROM "Citation";
DROP TABLE "Citation";
ALTER TABLE "new_Citation" RENAME TO "Citation";
CREATE INDEX "Citation_userId_idx" ON "Citation"("userId");
CREATE UNIQUE INDEX "Citation_id_userId_key" ON "Citation"("id", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Update existing citations with default values
UPDATE "Citation"
SET 
  type = 'article',
  source = 'Unknown',
  bibtex = '@article{' || id || ',
  title={' || title || '},
  author={' || authorsJson || '},
  year={' || year || '}
}',
  inTextCitation = '(' || substr(authorsJson, 1, instr(authorsJson, ',') - 1) || ', ' || year || ')',
  bibliography = title || '. ' || authorsJson || '. ' || year || '.'
WHERE type = 'article';
