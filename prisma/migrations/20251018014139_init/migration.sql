-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "username" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "World" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "prompt" TEXT NOT NULL,
    "imageUrl" TEXT,
    "thumbnailUrl" TEXT,
    "sceneData" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "tags" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "World_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorldAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "worldId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorldAsset_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorldVisit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "worldId" TEXT NOT NULL,
    "userId" TEXT,
    "duration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorldVisit_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorldVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorldInteraction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "worldId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorldInteraction_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorldInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "World_authorId_idx" ON "World"("authorId");

-- CreateIndex
CREATE INDEX "World_visibility_idx" ON "World"("visibility");

-- CreateIndex
CREATE INDEX "World_createdAt_idx" ON "World"("createdAt");

-- CreateIndex
CREATE INDEX "World_viewCount_idx" ON "World"("viewCount");

-- CreateIndex
CREATE INDEX "WorldAsset_worldId_idx" ON "WorldAsset"("worldId");

-- CreateIndex
CREATE INDEX "WorldAsset_type_idx" ON "WorldAsset"("type");

-- CreateIndex
CREATE INDEX "WorldVisit_worldId_idx" ON "WorldVisit"("worldId");

-- CreateIndex
CREATE INDEX "WorldVisit_userId_idx" ON "WorldVisit"("userId");

-- CreateIndex
CREATE INDEX "WorldVisit_createdAt_idx" ON "WorldVisit"("createdAt");

-- CreateIndex
CREATE INDEX "WorldInteraction_worldId_idx" ON "WorldInteraction"("worldId");

-- CreateIndex
CREATE INDEX "WorldInteraction_userId_idx" ON "WorldInteraction"("userId");
