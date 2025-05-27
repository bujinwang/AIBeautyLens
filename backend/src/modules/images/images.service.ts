import { Injectable, NotFoundException, Logger } from '@nestjs/common';
// import { GcsService } from '../gcs/gcs.service'; // If direct GCS interaction is needed
// import { PrismaService } from '../../prisma/prisma.service'; // For fetching clinician/patient details
// import { CreateImageDto } from './dto/create-image.dto';
// import { RequestAnalysisDto } from './dto/request-analysis.dto';
// import { ImageResponseDto } from './dto/image-response.dto';
// import { AnalysisRecordResponseDto } from './dto/analysis-record-response.dto';
// Firestore Admin SDK
// import * as admin from 'firebase-admin';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);
  // private firestore = admin.firestore(); // Initialize Firestore

  constructor(
    // private readonly gcsService: GcsService, // Example injection
    // private readonly prisma: PrismaService, // Example injection
  ) {}

  // async notifyImageUpload(createImageDto: CreateImageDto, clinicianId: string): Promise<ImageResponseDto> {
  //   this.logger.log(`Received image upload notification from clinician: ${clinicianId}`);
  //   // 1. Create Image document in Firestore 'Images' collection
  //   //    - Generate a unique imageId
  //   //    - Store gcsPath, patientId, clinicianId (uploader), uploadTimestamp, etc.
  //   // 2. If initialAnalysisType is provided in createImageDto:
  //   //    - Create AnalysisRecord document in Firestore 'AnalysisRecords' collection
  //   //      - Generate unique analysisId
  //   //      - Link to imageId
  //   //      - Set analysisType, analysisStatus: 'pending', analysisTimestamp
  //   //      - This will trigger the Cloud Function
  //   // 3. Return ImageResponseDto (or a DTO confirming registration)
  //   return Promise.resolve(null); // Placeholder
  // }

  // async requestNewAnalysis(
  //   imageId: string,
  //   initiatedByClinicianId: string,
  //   requestAnalysisDto: RequestAnalysisDto,
  // ): Promise<AnalysisRecordResponseDto> {
  //   this.logger.log(`Request for new analysis on image ${imageId} by clinician ${initiatedByClinicianId}`);
  //   // 1. Verify imageId exists in 'Images' collection (optional, or let Firestore rules handle)
  //   // 2. Create AnalysisRecord document in 'AnalysisRecords'
  //   //    - Generate unique analysisId
  //   //    - Link to imageId
  //   //    - Store analysisType, analysisParameters, initiatedByClinicianId, analysisStatus: 'pending', analysisTimestamp
  //   //    - This will trigger the Cloud Function
  //   // 3. Return AnalysisRecordResponseDto (or a DTO confirming request)
  //   return Promise.resolve(null); // Placeholder
  // }

  // async getAnalysesForImage(imageId: string): Promise<AnalysisRecordResponseDto[]> {
  //   this.logger.log(`Fetching all analysis records for image ${imageId}`);
  //   // 1. Query 'AnalysisRecords' collection where imageId matches
  //   // 2. Map results to AnalysisRecordResponseDto
  //   // 3. Return array
  //   return Promise.resolve([]); // Placeholder
  // }

  // async getAnalysisById(analysisId: string): Promise<AnalysisRecordResponseDto> {
  //   this.logger.log(`Fetching analysis record ${analysisId}`);
  //   // 1. Fetch document from 'AnalysisRecords' by analysisId
  //   // 2. If not found, throw NotFoundException
  //   // 3. Map to AnalysisRecordResponseDto and return
  //   return Promise.resolve(null); // Placeholder
  // }

  // async getImageWithHistory(imageId: string): Promise<ImageResponseDto> {
  //   this.logger.log(`Fetching image ${imageId} with its analysis history`);
  //   // 1. Fetch Image document from 'Images' collection by imageId
  //   // 2. If not found, throw NotFoundException
  //   // 3. Fetch all related AnalysisRecords for this imageId
  //   // 4. Construct and return ImageResponseDto, embedding the analysis records
  //   return Promise.resolve(null); // Placeholder
  // }
}