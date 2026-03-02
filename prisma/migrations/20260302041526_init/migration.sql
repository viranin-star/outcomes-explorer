-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "degreeLevel" TEXT NOT NULL,
    "cipCode" TEXT,
    "institution" TEXT,
    "tuitionMin" INTEGER,
    "tuitionMax" INTEGER,
    "transparencyScore" INTEGER,
    "hasAuditedOutcomes" BOOLEAN NOT NULL DEFAULT false,
    "hasSelfReported" BOOLEAN NOT NULL DEFAULT false,
    "dataYear" INTEGER,
    "hasPlacementRate" BOOLEAN NOT NULL DEFAULT false,
    "hasEmployerList" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Occupation" (
    "socCode" TEXT NOT NULL,
    "onetCode" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "industryGroup" TEXT,
    "requiresLicense" BOOLEAN NOT NULL DEFAULT false,
    "licenseNotes" TEXT,

    CONSTRAINT "Occupation_pkey" PRIMARY KEY ("socCode")
);

-- CreateTable
CREATE TABLE "ProgramOccupation" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "socCode" TEXT NOT NULL,
    "commonality" TEXT NOT NULL,
    "probabilityScore" DOUBLE PRECISION,

    CONSTRAINT "ProgramOccupation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramEarnings" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "cohortYear" INTEGER,
    "earlyP25" INTEGER,
    "earlyMedian" INTEGER,
    "earlyP75" INTEGER,
    "midP25" INTEGER,
    "midMedian" INTEGER,
    "midP75" INTEGER,
    "noDegreeMed" INTEGER,
    "source" TEXT,

    CONSTRAINT "ProgramEarnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OccupationalEarnings" (
    "id" TEXT NOT NULL,
    "socCode" TEXT NOT NULL,
    "region" TEXT,
    "year" INTEGER NOT NULL,
    "p25" INTEGER,
    "median" INTEGER,
    "p75" INTEGER,
    "growthRate" DOUBLE PRECISION,

    CONSTRAINT "OccupationalEarnings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Program_slug_key" ON "Program"("slug");

-- AddForeignKey
ALTER TABLE "ProgramOccupation" ADD CONSTRAINT "ProgramOccupation_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramOccupation" ADD CONSTRAINT "ProgramOccupation_socCode_fkey" FOREIGN KEY ("socCode") REFERENCES "Occupation"("socCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramEarnings" ADD CONSTRAINT "ProgramEarnings_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccupationalEarnings" ADD CONSTRAINT "OccupationalEarnings_socCode_fkey" FOREIGN KEY ("socCode") REFERENCES "Occupation"("socCode") ON DELETE RESTRICT ON UPDATE CASCADE;
