-- CreateTable
CREATE TABLE "Firm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "founded" TEXT,
    "hq" TEXT,
    "estimatedAum" TEXT,
    "investmentStage" TEXT,
    "targetCompanySize" TEXT,
    "healthcareSubsectors" TEXT,
    "website" TEXT,
    "notableExits" TEXT,
    "clearstartNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Firm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "website" TEXT,
    "subsector" TEXT,
    "stage" TEXT,
    "description" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION,
    "tier" TEXT,
    "teamSignals" INTEGER,
    "teamSignalsNotes" TEXT,
    "brandPositioning" INTEGER,
    "brandPositioningNotes" TEXT,
    "websiteDigital" INTEGER,
    "websiteDigitalNotes" TEXT,
    "contentSocial" INTEGER,
    "contentSocialNotes" TEXT,
    "thoughtLeadership" INTEGER,
    "thoughtLeadershipNotes" TEXT,
    "icpClarity" INTEGER,
    "icpClarityNotes" TEXT,
    "demandGen" INTEGER,
    "demandGenNotes" TEXT,
    "salesEnablement" INTEGER,
    "salesEnablementNotes" TEXT,
    "competitiveDiff" INTEGER,
    "competitiveDiffNotes" TEXT,
    "urgencySignals" TEXT[],
    "competitiveNotes" TEXT,
    "suggestedServiceEntry" TEXT,
    "suggestedOutreach" TEXT,
    "outreachAngle" TEXT,
    "rawResearch" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Company_firmId_idx" ON "Company"("firmId");

-- CreateIndex
CREATE INDEX "Audit_companyId_idx" ON "Audit"("companyId");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
