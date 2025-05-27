-- CreateTable
CREATE TABLE "TreatmentType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreatmentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentRecord" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "totalPrice" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "clinicianId" TEXT NOT NULL,
    "treatmentTypeId" TEXT NOT NULL,
    "firestoreAnalysisRecordId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreatmentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TreatmentType_name_key" ON "TreatmentType"("name");

-- AddForeignKey
ALTER TABLE "TreatmentRecord" ADD CONSTRAINT "TreatmentRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentRecord" ADD CONSTRAINT "TreatmentRecord_clinicianId_fkey" FOREIGN KEY ("clinicianId") REFERENCES "Clinician"("clinician_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentRecord" ADD CONSTRAINT "TreatmentRecord_treatmentTypeId_fkey" FOREIGN KEY ("treatmentTypeId") REFERENCES "TreatmentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
