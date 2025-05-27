import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
// import { PrismaModule } from '../../prisma/prisma.module'; // To be uncommented if PrismaService is used
// import { GcsModule } from '../gcs/gcs.module'; // To be uncommented if GcsService is used

@Module({
  // imports: [PrismaModule, GcsModule], // To be populated as needed
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}