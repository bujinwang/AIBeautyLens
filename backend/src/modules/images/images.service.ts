import { Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
// import { GcsService } from '../gcs/gcs.service'; // If direct GCS interaction is needed
// import { PrismaService } from '../../prisma/prisma.service'; // For fetching clinician/patient details
import { CreateImageDto } from './dto/create-image.dto';
import { RequestAnalysisDto } from './dto/request-analysis.dto';
import { ImageResponseDto } from './dto/image-response.dto';
import { AnalysisRecordResponseDto } from './dto/analysis-record-response.dto';
// Firestore Admin SDK
import * as admin from 'firebase-admin';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);
  private firestore: admin.firestore.Firestore;

  constructor(
    // private readonly gcsService: GcsService, // Example injection
    // private readonly prisma: PrismaService, // Example injection
  ) {
    // Ensure Firebase Admin is initialized (typically in main.ts or a Firebase module)
    if (admin.apps.length === 0) {
      // This is a fallback, ideally initialization is done centrally
      // admin.initializeApp({ credential: admin.credential.applicationDefault() });
      this.logger.warn('Firebase Admin SDK not initialized. Attempting default initialization. This should be handled centrally.');
      // For local development, you might need to set GOOGLE_APPLICATION_CREDENTIALS
      // or initialize with a service account key if not using ADC.
      // However, the project brief mentions issues with service account keys.
      // This setup assumes ADC is configured and working for Firestore.
    }
    this.firestore = admin.firestore();
  }

  async createImageRecord(createImageDto: CreateImageDto, clinicianId: string): Promise<ImageResponseDto> {
    this.logger.log(`Creating image record for patient ${createImageDto.patientId} by clinician ${clinicianId}`);

    const imageId = this.firestore.collection('Images').doc().id;
    const uploadTimestamp = admin.firestore.FieldValue.serverTimestamp();
    const analyses: AnalysisRecordResponseDto[] = [];

    const imageDocData = {
      imageId, // Storing as a field as well for easier querying if needed
      gcsPath: createImageDto.gcsPath,
      patientId: createImageDto.patientId,
      clinicianId, // The clinician who uploaded/initiated
      uploadTimestamp,
      originalFileName: createImageDto.originalFileName || null,
      contentType: createImageDto.contentType || null,
      imageNotes: createImageDto.imageNotes || null,
    };

    try {
      const imageRef = this.firestore.collection('Images').doc(imageId);
      await imageRef.set(imageDocData);
      this.logger.log(`Image document ${imageId} created in Firestore.`);

      let initialAnalysisRecord: AnalysisRecordResponseDto | null = null;

      if (createImageDto.initialAnalysisType) {
        const analysisId = this.firestore.collection('AnalysisRecords').doc().id;
        const requestTimestamp = admin.firestore.FieldValue.serverTimestamp();
        const analysisDocData = {
          analysisId, // Storing as a field
          imageId,
          analysisType: createImageDto.initialAnalysisType,
          promptConfigurationId: createImageDto.initialPromptConfigurationId || null,
          analysisStatus: 'pending', // Initial status
          initiatedByClinicianId: clinicianId,
          requestTimestamp,
          // Other fields like resultData, completionTimestamp will be added later by the analysis process
        };
        await this.firestore.collection('AnalysisRecords').doc(analysisId).set(analysisDocData);
        this.logger.log(`Initial analysis record ${analysisId} created for image ${imageId}.`);
        
        // Fetch the created analysis record to get the server timestamp for requestTimestamp
        const createdAnalysisDoc = await this.firestore.collection('AnalysisRecords').doc(analysisId).get();
        const createdAnalysisData = createdAnalysisDoc.data();

        initialAnalysisRecord = {
          analysisId,
          imageId,
          analysisType: createImageDto.initialAnalysisType,
          promptConfigurationId: createImageDto.initialPromptConfigurationId,
          analysisStatus: 'pending',
          initiatedByClinicianId: clinicianId,
          analysisTimestamp: (createdAnalysisData.requestTimestamp as admin.firestore.Timestamp).toDate(), // Use actual server timestamp
          // analysisParameters: {}, // Add if applicable from DTO or defaults
          // analysisResult: {}, // Not available at creation
          // errorMessage: undefined, // Not available at creation
        };
        analyses.push(initialAnalysisRecord);
      }

      // Fetch the created image data to get the server timestamp
      const createdImageDoc = await imageRef.get();
      const createdImageData = createdImageDoc.data();

      return {
        imageId: imageId,
        gcsPath: createdImageData.gcsPath,
        patientId: createdImageData.patientId,
        clinicianId: createdImageData.clinicianId,
        uploadTimestamp: (createdImageData.uploadTimestamp as admin.firestore.Timestamp).toDate(),
        originalFileName: createdImageData.originalFileName,
        contentType: createdImageData.contentType,
        imageNotes: createdImageData.imageNotes,
        analyses,
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to create image record or initial analysis: ${error.message}`, error.stack);
      } else {
        this.logger.error('Failed to create image record or initial analysis: An unknown error occurred', error);
      }
      throw new InternalServerErrorException('Failed to create image record.');
    }
  }

  async requestNewAnalysis(
    imageId: string,
    initiatedByClinicianId: string,
    requestAnalysisDto: RequestAnalysisDto,
  ): Promise<AnalysisRecordResponseDto> {
    this.logger.log(`Request for new analysis on image ${imageId} by clinician ${initiatedByClinicianId}`);

    const imageRef = this.firestore.collection('Images').doc(imageId);

    try {
      const imageDoc = await imageRef.get();
      if (!imageDoc.exists) {
        this.logger.warn(`Image with ID ${imageId} not found when requesting new analysis.`);
        throw new NotFoundException(`Image with ID ${imageId} not found.`);
      }

      const analysisId = this.firestore.collection('AnalysisRecords').doc().id;
      const requestTimestamp = admin.firestore.FieldValue.serverTimestamp();

      const analysisDocData = {
        analysisId,
        imageId,
        analysisType: requestAnalysisDto.analysisType,
        promptConfigurationId: requestAnalysisDto.promptConfigurationId || null,
        analysisParameters: requestAnalysisDto.analysisParameters || {},
        analysisStatus: 'pending', // Initial status
        initiatedByClinicianId,
        requestTimestamp,
        // resultData and completionTimestamp will be added by the analysis process
      };

      const analysisRecordRef = this.firestore.collection('AnalysisRecords').doc(analysisId);
      await analysisRecordRef.set(analysisDocData);
      this.logger.log(`New analysis record ${analysisId} created for image ${imageId}.`);

      // Fetch the created analysis record to get the server timestamp
      const createdAnalysisDoc = await analysisRecordRef.get();
      const createdAnalysisData = createdAnalysisDoc.data();

      return {
        analysisId,
        imageId,
        analysisType: createdAnalysisData.analysisType,
        promptConfigurationId: createdAnalysisData.promptConfigurationId,
        analysisParameters: createdAnalysisData.analysisParameters,
        analysisStatus: createdAnalysisData.analysisStatus,
        initiatedByClinicianId: createdAnalysisData.initiatedByClinicianId,
        analysisTimestamp: (createdAnalysisData.requestTimestamp as admin.firestore.Timestamp).toDate(),
        // analysisResult and errorMessage will be populated later
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Error) {
        this.logger.error(`Failed to request new analysis for image ${imageId}: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Failed to request new analysis for image ${imageId}: An unknown error occurred`, error);
      }
      throw new InternalServerErrorException(`Failed to request new analysis for image ${imageId}.`);
    }
  }

  async getAnalysesForImage(imageId: string): Promise<AnalysisRecordResponseDto[]> {
    this.logger.log(`Fetching all analysis records for image ${imageId}`);

    const imageRef = this.firestore.collection('Images').doc(imageId);
    const analyses: AnalysisRecordResponseDto[] = [];

    try {
      const imageDoc = await imageRef.get();
      if (!imageDoc.exists) {
        this.logger.warn(`Image with ID ${imageId} not found when fetching analysis history.`);
        throw new NotFoundException(`Image with ID ${imageId} not found.`);
      }

      const analysisRecordsSnapshot = await this.firestore
        .collection('AnalysisRecords')
        .where('imageId', '==', imageId)
        .orderBy('requestTimestamp', 'desc') // Get newest first, or 'asc' for oldest
        .get();

      if (analysisRecordsSnapshot.empty) {
        this.logger.log(`No analysis records found for image ${imageId}.`);
        return [];
      }

      analysisRecordsSnapshot.forEach(doc => {
        const data = doc.data();
        analyses.push({
          analysisId: data.analysisId,
          imageId: data.imageId,
          analysisType: data.analysisType,
          promptConfigurationId: data.promptConfigurationId,
          analysisParameters: data.analysisParameters,
          analysisStatus: data.analysisStatus,
          initiatedByClinicianId: data.initiatedByClinicianId,
          analysisTimestamp: (data.requestTimestamp as admin.firestore.Timestamp).toDate(),
          analysisResult: data.analysisResult,
          errorMessage: data.errorMessage,
        });
      });

      return analyses;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Error) {
        this.logger.error(`Failed to get analyses for image ${imageId}: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Failed to get analyses for image ${imageId}: An unknown error occurred`, error);
      }
      throw new InternalServerErrorException(`Failed to get analyses for image ${imageId}.`);
    }
  }

  async getAnalysisById(analysisId: string): Promise<AnalysisRecordResponseDto> {
    this.logger.log(`Fetching analysis record ${analysisId}`);
    const analysisRecordRef = this.firestore.collection('AnalysisRecords').doc(analysisId);

    try {
      const doc = await analysisRecordRef.get();
      if (!doc.exists) {
        this.logger.warn(`Analysis record with ID ${analysisId} not found.`);
        throw new NotFoundException(`Analysis record with ID ${analysisId} not found.`);
      }

      const data = doc.data();
      return {
        analysisId: data.analysisId,
        imageId: data.imageId,
        analysisType: data.analysisType,
        promptConfigurationId: data.promptConfigurationId,
        analysisParameters: data.analysisParameters,
        analysisStatus: data.analysisStatus,
        initiatedByClinicianId: data.initiatedByClinicianId,
        analysisTimestamp: (data.requestTimestamp as admin.firestore.Timestamp).toDate(), // Assuming requestTimestamp is the main timestamp for the record
        analysisResult: data.analysisResult,
        errorMessage: data.errorMessage,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Error) {
        this.logger.error(`Failed to get analysis record ${analysisId}: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Failed to get analysis record ${analysisId}: An unknown error occurred`, error);
      }
      throw new InternalServerErrorException(`Failed to get analysis record ${analysisId}.`);
    }
  }

  async getImageWithHistory(imageId: string): Promise<ImageResponseDto> {
    this.logger.log(`Fetching image ${imageId} with its analysis history`);
    const imageRef = this.firestore.collection('Images').doc(imageId);

    try {
      const imageDoc = await imageRef.get();
      if (!imageDoc.exists) {
        this.logger.warn(`Image with ID ${imageId} not found when fetching details with history.`);
        throw new NotFoundException(`Image with ID ${imageId} not found.`);
      }

      const imageData = imageDoc.data();
      const analyses = await this.getAnalysesForImage(imageId); // Reuse existing method

      return {
        imageId: imageData.imageId,
        gcsPath: imageData.gcsPath,
        patientId: imageData.patientId,
        clinicianId: imageData.clinicianId,
        uploadTimestamp: (imageData.uploadTimestamp as admin.firestore.Timestamp).toDate(),
        originalFileName: imageData.originalFileName,
        contentType: imageData.contentType,
        imageNotes: imageData.imageNotes,
        analyses,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Error) {
        this.logger.error(`Failed to get image ${imageId} with history: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Failed to get image ${imageId} with history: An unknown error occurred`, error);
      }
      throw new InternalServerErrorException(`Failed to get image ${imageId} with history.`);
    }
  }
}