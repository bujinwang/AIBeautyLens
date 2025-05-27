import { Module } from '@nestjs/common';
import { CliniciansService } from './clinicians.service';
// We might add CliniciansController here later if needed for direct CRUD on clinicians

@Module({
  // PrismaModule is global, so PrismaService is available
  providers: [CliniciansService],
  exports: [CliniciansService], // Export CliniciansService so AuthModule can use it
  // controllers: [CliniciansController], // Uncomment if a controller is added
})
export class CliniciansModule {}