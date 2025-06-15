-- AlterTable
ALTER TABLE "TreatmentType" ADD COLUMN     "area" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "contraindications" TEXT,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "price" DECIMAL(65,30),
ADD COLUMN     "restrictions" TEXT;

-- CreateTable
CREATE TABLE "TreatmentTypeTranslation" (
    "id" TEXT NOT NULL,
    "treatmentTypeId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "area" TEXT,
    "contraindications" TEXT,
    "restrictions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreatmentTypeTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TreatmentTypeTranslation_treatmentTypeId_language_key" ON "TreatmentTypeTranslation"("treatmentTypeId", "language");

-- AddForeignKey
ALTER TABLE "TreatmentTypeTranslation" ADD CONSTRAINT "TreatmentTypeTranslation_treatmentTypeId_fkey" FOREIGN KEY ("treatmentTypeId") REFERENCES "TreatmentType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
