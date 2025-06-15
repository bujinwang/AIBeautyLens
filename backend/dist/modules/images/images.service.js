"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ImagesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const role_enum_1 = require("../auth/enums/role.enum");
const admin = __importStar(require("firebase-admin"));
let ImagesService = ImagesService_1 = class ImagesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ImagesService_1.name);
        if (admin.apps.length === 0) {
            this.logger.warn('Firebase Admin SDK not initialized. Attempting default initialization. This should be handled centrally.');
        }
        this.firestore = admin.firestore();
    }
    async isUserAuthorizedForImage(imageId, user) {
        const imageDoc = await this.firestore.collection('Images').doc(imageId).get();
        if (!imageDoc.exists) {
            throw new common_1.NotFoundException(`Image with ID ${imageId} not found.`);
        }
        const imageData = imageDoc.data();
        if (user.roles.includes(role_enum_1.Role.Admin)) {
            return true;
        }
        if (user.roles.includes(role_enum_1.Role.Patient)) {
            return imageData.patientId === user.userId;
        }
        if (user.roles.includes(role_enum_1.Role.Clinician)) {
            if (imageData.clinicianId === user.userId) {
                return true;
            }
            if (imageData.patientId) {
                const assignment = await this.prisma.clinicianPatientAssignment.findUnique({
                    where: {
                        clinician_id_patient_id: {
                            clinician_id: user.userId,
                            patient_id: imageData.patientId,
                        },
                    },
                });
                return !!assignment;
            }
        }
        return false;
    }
    async createImageRecord(createImageDto, clinicianId) {
        this.logger.log(`Creating image record for patient ${createImageDto.patientId} by clinician ${clinicianId}`);
        const imageId = this.firestore.collection('Images').doc().id;
        const uploadTimestamp = admin.firestore.FieldValue.serverTimestamp();
        const analyses = [];
        const imageDocData = {
            imageId,
            gcsPath: createImageDto.gcsPath,
            patientId: createImageDto.patientId,
            clinicianId,
            uploadTimestamp,
            originalFileName: createImageDto.originalFileName || null,
            contentType: createImageDto.contentType || null,
            imageNotes: createImageDto.imageNotes || null,
        };
        try {
            const imageRef = this.firestore.collection('Images').doc(imageId);
            await imageRef.set(imageDocData);
            this.logger.log(`Image document ${imageId} created in Firestore.`);
            let initialAnalysisRecord = null;
            if (createImageDto.initialAnalysisType) {
                const analysisId = this.firestore.collection('AnalysisRecords').doc().id;
                const requestTimestamp = admin.firestore.FieldValue.serverTimestamp();
                const analysisDocData = {
                    analysisId,
                    imageId,
                    analysisType: createImageDto.initialAnalysisType,
                    promptConfigurationId: createImageDto.initialPromptConfigurationId || null,
                    analysisStatus: 'pending',
                    initiatedByClinicianId: clinicianId,
                    requestTimestamp,
                };
                await this.firestore.collection('AnalysisRecords').doc(analysisId).set(analysisDocData);
                this.logger.log(`Initial analysis record ${analysisId} created for image ${imageId}.`);
                const createdAnalysisDoc = await this.firestore.collection('AnalysisRecords').doc(analysisId).get();
                const createdAnalysisData = createdAnalysisDoc.data();
                initialAnalysisRecord = {
                    analysisId,
                    imageId,
                    analysisType: createImageDto.initialAnalysisType,
                    promptConfigurationId: createImageDto.initialPromptConfigurationId,
                    analysisStatus: 'pending',
                    initiatedByClinicianId: clinicianId,
                    analysisTimestamp: createdAnalysisData.requestTimestamp.toDate(),
                };
                analyses.push(initialAnalysisRecord);
            }
            const createdImageDoc = await imageRef.get();
            const createdImageData = createdImageDoc.data();
            return {
                imageId: imageId,
                gcsPath: createdImageData.gcsPath,
                patientId: createdImageData.patientId,
                clinicianId: createdImageData.clinicianId,
                uploadTimestamp: createdImageData.uploadTimestamp.toDate(),
                originalFileName: createdImageData.originalFileName,
                contentType: createdImageData.contentType,
                imageNotes: createdImageData.imageNotes,
                analyses,
            };
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to create image record or initial analysis: ${error.message}`, error.stack);
            }
            else {
                this.logger.error('Failed to create image record or initial analysis: An unknown error occurred', error);
            }
            throw new common_1.InternalServerErrorException('Failed to create image record.');
        }
    }
    async requestNewAnalysis(imageId, initiatedByClinicianId, requestAnalysisDto, user) {
        this.logger.log(`Request for new analysis on image ${imageId} by clinician ${initiatedByClinicianId}, requested by user ${user.userId}`);
        const isAuthorizedForImage = await this.isUserAuthorizedForImage(imageId, user);
        if (!isAuthorizedForImage) {
            throw new common_1.ForbiddenException(`User ${user.userId} is not authorized to request analysis for image ${imageId}.`);
        }
        if (!user.roles.includes(role_enum_1.Role.Admin) && initiatedByClinicianId !== user.userId) {
            throw new common_1.ForbiddenException(`Authenticated user ${user.userId} cannot request analysis on behalf of clinician ${initiatedByClinicianId}.`);
        }
        const imageRef = this.firestore.collection('Images').doc(imageId);
        try {
            const imageDoc = await imageRef.get();
            if (!imageDoc.exists) {
                this.logger.warn(`Image with ID ${imageId} not found when requesting new analysis.`);
                throw new common_1.NotFoundException(`Image with ID ${imageId} not found.`);
            }
            const analysisId = this.firestore.collection('AnalysisRecords').doc().id;
            const requestTimestamp = admin.firestore.FieldValue.serverTimestamp();
            const analysisDocData = {
                analysisId,
                imageId,
                analysisType: requestAnalysisDto.analysisType,
                promptConfigurationId: requestAnalysisDto.promptConfigurationId || null,
                analysisParameters: requestAnalysisDto.analysisParameters || {},
                analysisStatus: 'pending',
                initiatedByClinicianId,
                requestTimestamp,
            };
            const analysisRecordRef = this.firestore.collection('AnalysisRecords').doc(analysisId);
            await analysisRecordRef.set(analysisDocData);
            this.logger.log(`New analysis record ${analysisId} created for image ${imageId}.`);
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
                analysisTimestamp: createdAnalysisData.requestTimestamp.toDate(),
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            if (error instanceof Error) {
                this.logger.error(`Failed to request new analysis for image ${imageId}: ${error.message}`, error.stack);
            }
            else {
                this.logger.error(`Failed to request new analysis for image ${imageId}: An unknown error occurred`, error);
            }
            throw new common_1.InternalServerErrorException(`Failed to request new analysis for image ${imageId}.`);
        }
    }
    async getAnalysesForImage(imageId, user) {
        this.logger.log(`Fetching all analysis records for image ${imageId} by user ${user.userId}`);
        const isAuthorized = await this.isUserAuthorizedForImage(imageId, user);
        if (!isAuthorized) {
            throw new common_1.ForbiddenException(`User ${user.userId} is not authorized to access analyses for image ${imageId}.`);
        }
        const analyses = [];
        try {
            const analysisRecordsSnapshot = await this.firestore
                .collection('AnalysisRecords')
                .where('imageId', '==', imageId)
                .orderBy('requestTimestamp', 'desc')
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
                    analysisTimestamp: data.requestTimestamp.toDate(),
                    analysisResult: data.analysisResult,
                    errorMessage: data.errorMessage,
                });
            });
            return analyses;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            if (error instanceof Error) {
                this.logger.error(`Failed to get analyses for image ${imageId}: ${error.message}`, error.stack);
            }
            else {
                this.logger.error(`Failed to get analyses for image ${imageId}: An unknown error occurred`, error);
            }
            throw new common_1.InternalServerErrorException(`Failed to get analyses for image ${imageId}.`);
        }
    }
    async getAnalysisById(analysisId, user) {
        this.logger.log(`Fetching analysis record ${analysisId} by user ${user.userId}`);
        const analysisRecordRef = this.firestore.collection('AnalysisRecords').doc(analysisId);
        try {
            const doc = await analysisRecordRef.get();
            if (!doc.exists) {
                this.logger.warn(`Analysis record with ID ${analysisId} not found.`);
                throw new common_1.NotFoundException(`Analysis record with ID ${analysisId} not found.`);
            }
            const data = doc.data();
            const imageId = data.imageId;
            if (!imageId) {
                this.logger.error(`Analysis record ${analysisId} is missing imageId.`);
                throw new common_1.InternalServerErrorException('Analysis record is incomplete.');
            }
            const isAuthorized = await this.isUserAuthorizedForImage(imageId, user);
            if (!isAuthorized) {
                throw new common_1.ForbiddenException(`User ${user.userId} is not authorized to access analysis record ${analysisId} (via image ${imageId}).`);
            }
            return {
                analysisId: data.analysisId,
                imageId: data.imageId,
                analysisType: data.analysisType,
                promptConfigurationId: data.promptConfigurationId,
                analysisParameters: data.analysisParameters,
                analysisStatus: data.analysisStatus,
                initiatedByClinicianId: data.initiatedByClinicianId,
                analysisTimestamp: data.requestTimestamp.toDate(),
                analysisResult: data.analysisResult,
                errorMessage: data.errorMessage,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.ForbiddenException || error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            if (error instanceof Error) {
                this.logger.error(`Failed to get analysis record ${analysisId} for user ${user.userId}: ${error.message}`, error.stack);
            }
            else {
                this.logger.error(`Failed to get analysis record ${analysisId} for user ${user.userId}: An unknown error occurred`, error);
            }
            throw new common_1.InternalServerErrorException(`Failed to get analysis record ${analysisId}.`);
        }
    }
    async getImageWithHistory(imageId, user) {
        this.logger.log(`Fetching image ${imageId} with its analysis history by user ${user.userId}`);
        try {
            const isAuthorized = await this.isUserAuthorizedForImage(imageId, user);
            if (!isAuthorized) {
                throw new common_1.ForbiddenException(`User ${user.userId} is not authorized to access image ${imageId}.`);
            }
            const imageRef = this.firestore.collection('Images').doc(imageId);
            const imageDoc = await imageRef.get();
            const imageData = imageDoc.data();
            const analyses = await this.getAnalysesForImage(imageId, user);
            return {
                imageId: imageData.imageId,
                gcsPath: imageData.gcsPath,
                patientId: imageData.patientId,
                clinicianId: imageData.clinicianId,
                uploadTimestamp: imageData.uploadTimestamp.toDate(),
                originalFileName: imageData.originalFileName,
                contentType: imageData.contentType,
                imageNotes: imageData.imageNotes,
                analyses,
            };
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Error in getImageWithHistory for image ${imageId} by user ${user.userId}. Error: ${error.message}`, error.stack);
            }
            else {
                this.logger.error(`Error in getImageWithHistory for image ${imageId} by user ${user.userId}. An unknown error occurred`, error);
            }
            if (error instanceof common_1.NotFoundException || error instanceof common_1.ForbiddenException || error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(`An unexpected error occurred while fetching image ${imageId} with history.`);
        }
    }
};
exports.ImagesService = ImagesService;
exports.ImagesService = ImagesService = ImagesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ImagesService);
