import { PrismaClient } from '@prisma/client';
import path from 'path';
import * as bcrypt from 'bcrypt'; // Import bcrypt
import { Role } from '../src/modules/auth/enums/role.enum'; // Import Role enum

// Dynamically import the constants from the app package
const appRoot = path.resolve(__dirname, '../../app/src/constants');
const treatmentDataPath = path.join(appRoot, 'treatmentData.ts');
const translationsPath = path.join(appRoot, 'translations/treatmentTranslations_en.ts');

// Use require for compatibility with ts-node (if ESM, use import)
const { BASE_TREATMENTS } = require(treatmentDataPath);
const { TREATMENT_TRANSLATIONS_EN } = require(translationsPath);

const prisma = new PrismaClient();

async function seedUsersAndClinicians() {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('password123', salt); // Use a strong default password

  // Create a sample Clinician User
  const clinicianUser = await prisma.user.upsert({
    where: { email: 'clinician@example.com' },
    update: {},
    create: {
      email: 'clinician@example.com',
      hashed_password: hashedPassword,
      salt: salt,
      roles: [Role.Clinician],
      email_verified: true, // Mark as verified for seeding purposes
    },
  });

  await prisma.clinician.upsert({
    where: { user_id: clinicianUser.user_id },
    update: {},
    create: {
      user_id: clinicianUser.user_id,
      name: 'Dr. Alice Smith',
      specialty: 'Dermatology',
    },
  });

  console.log(`Seeded clinician: ${clinicianUser.email}`);

  // Create a sample Patient User
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@example.com' },
    update: {},
    create: {
      email: 'patient@example.com',
      hashed_password: hashedPassword,
      salt: salt,
      roles: [Role.Patient],
      email_verified: true, // Mark as verified for seeding purposes
    },
  });

  await prisma.patient.upsert({
    where: { user_id: patientUser.user_id },
    update: {},
    create: {
      user_id: patientUser.user_id,
      full_name: 'John Doe',
      date_of_birth: new Date('1990-01-15'),
      gender: 'Male',
      contact_info: 'john.doe@example.com',
      additional_phi_details: 'No known allergies.',
    },
  });

  console.log(`Seeded patient: ${patientUser.email}`);
}

async function main() {
  await seedUsersAndClinicians(); // Call the new seeding function

  for (const treatment of BASE_TREATMENTS) {
    // Upsert TreatmentType using all schema fields
    const treatmentType = await prisma.treatmentType.upsert({
      where: { name: treatment.id },
      update: {},
      create: {
        name: treatment.id,
        description: '',
        category: treatment.category,
        area: treatment.area,
        price: treatment.price,
        currency: 'USD',
        contraindications: Array.isArray(treatment.contraindications) ? treatment.contraindications.join('; ') : (treatment.contraindications || ''),
        restrictions: treatment.restrictions || '',
        isActive: true,
      },
    });

    // Add translations (en, zh)
    const translations = TREATMENT_TRANSLATIONS_EN[treatment.id];
    if (translations) {
      for (const lang of Object.keys(translations)) {
        const translation = translations[lang];
        await prisma.treatmentTypeTranslation.upsert({
          where: {
            treatmentTypeId_language: {
              treatmentTypeId: treatmentType.id,
              language: lang,
            },
          },
          update: {
            name: translation.name,
            description: translation.description,
            category: treatment.category,
            area: treatment.area,
            contraindications: Array.isArray(treatment.contraindications) ? treatment.contraindications.join('; ') : (treatment.contraindications || ''),
            restrictions: treatment.restrictions || '',
          },
          create: {
            treatmentTypeId: treatmentType.id,
            language: lang,
            name: translation.name,
            description: translation.description,
            category: treatment.category,
            area: treatment.area,
            contraindications: Array.isArray(treatment.contraindications) ? treatment.contraindications.join('; ') : (treatment.contraindications || ''),
            restrictions: treatment.restrictions || '',
          },
        });
      }
    }
  }
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e); // Added more specific error logging
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Database seeding finished.'); // Added a final log
  });