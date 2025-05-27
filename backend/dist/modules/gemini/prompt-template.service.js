"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PromptTemplateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptTemplateService = void 0;
const common_1 = require("@nestjs/common");
const firestore_1 = require("@google-cloud/firestore");
const uuid_1 = require("uuid");
let PromptTemplateService = PromptTemplateService_1 = class PromptTemplateService {
    constructor() {
        this.collectionName = 'promptTemplates';
        this.logger = new common_1.Logger(PromptTemplateService_1.name);
        try {
            this.firestore = new firestore_1.Firestore();
            this.logger.log('Firestore connection initialized for prompt templates');
        }
        catch (error) {
            this.logger.error('Failed to initialize Firestore connection', error);
            throw new common_1.InternalServerErrorException('Failed to connect to Firestore');
        }
    }
    async getPrompt(type, customId) {
        try {
            let query = this.firestore.collection(this.collectionName).where('type', '==', type);
            if (customId) {
                query = this.firestore.collection(this.collectionName).where('id', '==', customId);
            }
            const snapshot = await query.limit(1).get();
            if (snapshot.empty) {
                this.logger.warn(`Prompt template for type '${type}' not found.`);
                throw new common_1.NotFoundException(`Prompt template for type '${type}' not found.`);
            }
            const doc = snapshot.docs[0];
            return doc.get('prompt');
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error retrieving prompt template for type '${type}'`, error);
            throw new common_1.InternalServerErrorException('Failed to retrieve prompt template');
        }
    }
    async getAllPromptTemplates() {
        try {
            const snapshot = await this.firestore.collection(this.collectionName).get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }
        catch (error) {
            this.logger.error('Error retrieving all prompt templates', error);
            throw new common_1.InternalServerErrorException('Failed to retrieve prompt templates');
        }
    }
    async getPromptTemplatesByType(type) {
        try {
            const snapshot = await this.firestore.collection(this.collectionName)
                .where('type', '==', type)
                .get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }
        catch (error) {
            this.logger.error(`Error retrieving prompt templates for type '${type}'`, error);
            throw new common_1.InternalServerErrorException('Failed to retrieve prompt templates');
        }
    }
    async getPromptTemplateById(id) {
        try {
            const docRef = this.firestore.collection(this.collectionName).doc(id);
            const doc = await docRef.get();
            if (!doc.exists) {
                throw new common_1.NotFoundException(`Prompt template with ID '${id}' not found.`);
            }
            return {
                id: doc.id,
                ...doc.data()
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error retrieving prompt template with ID '${id}'`, error);
            throw new common_1.InternalServerErrorException('Failed to retrieve prompt template');
        }
    }
    async createPromptTemplate(createPromptDto) {
        try {
            const nameSnapshot = await this.firestore.collection(this.collectionName)
                .where('name', '==', createPromptDto.name)
                .limit(1)
                .get();
            if (!nameSnapshot.empty) {
                throw new common_1.ConflictException(`A prompt template with name '${createPromptDto.name}' already exists.`);
            }
            const id = (0, uuid_1.v4)();
            const templateData = {
                id,
                ...createPromptDto,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            await this.firestore.collection(this.collectionName).doc(id).set(templateData);
            return templateData;
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            this.logger.error('Error creating prompt template', error);
            throw new common_1.InternalServerErrorException('Failed to create prompt template');
        }
    }
    async updatePromptTemplate(id, updatePromptDto) {
        try {
            const docRef = this.firestore.collection(this.collectionName).doc(id);
            const doc = await docRef.get();
            if (!doc.exists) {
                throw new common_1.NotFoundException(`Prompt template with ID '${id}' not found.`);
            }
            if (updatePromptDto.name) {
                const nameSnapshot = await this.firestore.collection(this.collectionName)
                    .where('name', '==', updatePromptDto.name)
                    .get();
                const conflicts = nameSnapshot.docs.filter(d => d.id !== id);
                if (conflicts.length > 0) {
                    throw new common_1.ConflictException(`A prompt template with name '${updatePromptDto.name}' already exists.`);
                }
            }
            const updateData = {
                ...updatePromptDto,
                updatedAt: new Date().toISOString()
            };
            await docRef.update(updateData);
            const updatedDoc = await docRef.get();
            return {
                id: updatedDoc.id,
                ...updatedDoc.data()
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.ConflictException) {
                throw error;
            }
            this.logger.error(`Error updating prompt template with ID '${id}'`, error);
            throw new common_1.InternalServerErrorException('Failed to update prompt template');
        }
    }
    async deletePromptTemplate(id) {
        try {
            const docRef = this.firestore.collection(this.collectionName).doc(id);
            const doc = await docRef.get();
            if (!doc.exists) {
                throw new common_1.NotFoundException(`Prompt template with ID '${id}' not found.`);
            }
            await docRef.delete();
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error deleting prompt template with ID '${id}'`, error);
            throw new common_1.InternalServerErrorException('Failed to delete prompt template');
        }
    }
};
exports.PromptTemplateService = PromptTemplateService;
exports.PromptTemplateService = PromptTemplateService = PromptTemplateService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PromptTemplateService);
