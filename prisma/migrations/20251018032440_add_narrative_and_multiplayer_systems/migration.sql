/*
  Warnings:

  - You are about to drop the `World` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorldAsset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorldInteraction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorldVisit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "World";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WorldAsset";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WorldInteraction";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WorldVisit";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Dilemma" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "situation" TEXT,
    "facts" TEXT,
    "immediateConsequences" TEXT,
    "longTermConsequences" TEXT,
    "ethicalPrinciples" TEXT,
    "hiddenMeaning" TEXT,
    "imageUrl" TEXT,
    "thumbnailUrl" TEXT,
    "sceneData" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "tags" TEXT,
    "complexity" INTEGER NOT NULL DEFAULT 5,
    "emotionalIntensity" INTEGER NOT NULL DEFAULT 5,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "choiceCount" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Dilemma_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Choice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dilemmaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "choice" TEXT NOT NULL,
    "timeSpent" INTEGER,
    "vrSession" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Choice_dilemmaId_fkey" FOREIGN KEY ("dilemmaId") REFERENCES "Dilemma" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Choice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bigFive" TEXT NOT NULL,
    "valueAxes" TEXT NOT NULL,
    "decisionPattern" TEXT,
    "defenseMechanisms" TEXT,
    "growthAreas" TEXT,
    "traits" TEXT,
    "choiceCount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Analysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DilemmaAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dilemmaId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DilemmaAsset_dilemmaId_fkey" FOREIGN KEY ("dilemmaId") REFERENCES "Dilemma" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DilemmaVisit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dilemmaId" TEXT NOT NULL,
    "userId" TEXT,
    "duration" INTEGER,
    "vrMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DilemmaVisit_dilemmaId_fkey" FOREIGN KEY ("dilemmaId") REFERENCES "Dilemma" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DilemmaVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "theme" TEXT,
    "genre" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 5,
    "startNodeId" TEXT,
    "authorId" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Story_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoryNode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storyId" TEXT NOT NULL,
    "dilemmaId" TEXT NOT NULL,
    "nodeOrder" INTEGER NOT NULL,
    "isStart" BOOLEAN NOT NULL DEFAULT false,
    "isEnd" BOOLEAN NOT NULL DEFAULT false,
    "contextBefore" TEXT,
    "contextAfter" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StoryNode_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StoryNode_dilemmaId_fkey" FOREIGN KEY ("dilemmaId") REFERENCES "Dilemma" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoryPath" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromNodeId" TEXT NOT NULL,
    "toNodeId" TEXT NOT NULL,
    "choice" TEXT NOT NULL,
    "transitionText" TEXT,
    "requiredChoices" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StoryPath_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "StoryNode" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StoryPath_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "StoryNode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserStoryProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "currentNodeId" TEXT,
    "choicesMade" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserStoryProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserStoryProgress_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "creatorId" TEXT NOT NULL,
    "maxPlayers" INTEGER NOT NULL DEFAULT 8,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "requiresPassword" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "currentDilemmaId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Room_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoomParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PARTICIPANT',
    "position" TEXT,
    "rotation" TEXT,
    "isInVR" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActive" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoomParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RoomParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Dilemma_authorId_idx" ON "Dilemma"("authorId");

-- CreateIndex
CREATE INDEX "Dilemma_visibility_idx" ON "Dilemma"("visibility");

-- CreateIndex
CREATE INDEX "Dilemma_category_idx" ON "Dilemma"("category");

-- CreateIndex
CREATE INDEX "Dilemma_createdAt_idx" ON "Dilemma"("createdAt");

-- CreateIndex
CREATE INDEX "Dilemma_choiceCount_idx" ON "Dilemma"("choiceCount");

-- CreateIndex
CREATE INDEX "Choice_userId_idx" ON "Choice"("userId");

-- CreateIndex
CREATE INDEX "Choice_dilemmaId_idx" ON "Choice"("dilemmaId");

-- CreateIndex
CREATE INDEX "Choice_createdAt_idx" ON "Choice"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Choice_dilemmaId_userId_key" ON "Choice"("dilemmaId", "userId");

-- CreateIndex
CREATE INDEX "Analysis_userId_idx" ON "Analysis"("userId");

-- CreateIndex
CREATE INDEX "Analysis_createdAt_idx" ON "Analysis"("createdAt");

-- CreateIndex
CREATE INDEX "DilemmaAsset_dilemmaId_idx" ON "DilemmaAsset"("dilemmaId");

-- CreateIndex
CREATE INDEX "DilemmaAsset_type_idx" ON "DilemmaAsset"("type");

-- CreateIndex
CREATE INDEX "DilemmaVisit_dilemmaId_idx" ON "DilemmaVisit"("dilemmaId");

-- CreateIndex
CREATE INDEX "DilemmaVisit_userId_idx" ON "DilemmaVisit"("userId");

-- CreateIndex
CREATE INDEX "DilemmaVisit_createdAt_idx" ON "DilemmaVisit"("createdAt");

-- CreateIndex
CREATE INDEX "Story_authorId_idx" ON "Story"("authorId");

-- CreateIndex
CREATE INDEX "Story_isPublished_idx" ON "Story"("isPublished");

-- CreateIndex
CREATE INDEX "Story_createdAt_idx" ON "Story"("createdAt");

-- CreateIndex
CREATE INDEX "StoryNode_storyId_idx" ON "StoryNode"("storyId");

-- CreateIndex
CREATE INDEX "StoryNode_dilemmaId_idx" ON "StoryNode"("dilemmaId");

-- CreateIndex
CREATE INDEX "StoryNode_nodeOrder_idx" ON "StoryNode"("nodeOrder");

-- CreateIndex
CREATE INDEX "StoryPath_fromNodeId_idx" ON "StoryPath"("fromNodeId");

-- CreateIndex
CREATE INDEX "StoryPath_toNodeId_idx" ON "StoryPath"("toNodeId");

-- CreateIndex
CREATE INDEX "StoryPath_choice_idx" ON "StoryPath"("choice");

-- CreateIndex
CREATE INDEX "UserStoryProgress_userId_idx" ON "UserStoryProgress"("userId");

-- CreateIndex
CREATE INDEX "UserStoryProgress_storyId_idx" ON "UserStoryProgress"("storyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserStoryProgress_userId_storyId_key" ON "UserStoryProgress"("userId", "storyId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_code_key" ON "Room"("code");

-- CreateIndex
CREATE INDEX "Room_code_idx" ON "Room"("code");

-- CreateIndex
CREATE INDEX "Room_creatorId_idx" ON "Room"("creatorId");

-- CreateIndex
CREATE INDEX "Room_isActive_idx" ON "Room"("isActive");

-- CreateIndex
CREATE INDEX "RoomParticipant_roomId_idx" ON "RoomParticipant"("roomId");

-- CreateIndex
CREATE INDEX "RoomParticipant_userId_idx" ON "RoomParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomParticipant_roomId_userId_key" ON "RoomParticipant"("roomId", "userId");
