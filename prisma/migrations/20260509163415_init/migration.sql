-- CreateTable
CREATE TABLE "contestant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contestant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" TEXT NOT NULL,
    "contestantId" TEXT NOT NULL,
    "voterEmail" TEXT NOT NULL,
    "voterName" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "voteCount" INTEGER NOT NULL DEFAULT 1,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "flutterRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "voteApplied" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "voteCost" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "votingActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contestant_voteCount_idx" ON "contestant"("voteCount");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_flutterRef_key" ON "transaction"("flutterRef");

-- CreateIndex
CREATE INDEX "transaction_flutterRef_idx" ON "transaction"("flutterRef");

-- CreateIndex
CREATE INDEX "transaction_status_idx" ON "transaction"("status");

-- CreateIndex
CREATE INDEX "transaction_contestantId_idx" ON "transaction"("contestantId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_user_email_key" ON "admin_user"("email");

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_contestantId_fkey" FOREIGN KEY ("contestantId") REFERENCES "contestant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
