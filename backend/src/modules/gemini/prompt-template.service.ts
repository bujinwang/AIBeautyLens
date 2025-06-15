import { Injectable, NotFoundException, InternalServerErrorException, ConflictException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Firestore } from '@google-cloud/firestore';
import { CreatePromptTemplateDto, UpdatePromptTemplateDto, PromptType } from './dto/prompt-template.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PromptTemplateService {
  private firestore: Firestore;
  private collectionName = 'promptTemplates';
  private readonly logger = new Logger(PromptTemplateService.name);
  private gcpProjectId: string;

  constructor(private readonly configService: ConfigService) {
    try {
      const projectIdFromConfig = this.configService.get<string>('GCS_PROJECT_ID'); // Corrected variable name
      this.logger.debug(`Attempting to retrieve GCS_PROJECT_ID from ConfigService. Value: '${projectIdFromConfig}'`);
      this.gcpProjectId = projectIdFromConfig;
      if (!this.gcpProjectId) {
        this.logger.error('GCS_PROJECT_ID is not configured in the environment variables or is empty.');
        throw new InternalServerErrorException('GCS_PROJECT_ID is not configured. Firestore cannot be initialized.');
      }
      this.firestore = new Firestore({ projectId: this.gcpProjectId });
      this.logger.log(`Firestore connection initialized for prompt templates with projectId: ${this.gcpProjectId}`);
    } catch (error) {
      this.logger.error('Failed to initialize Firestore connection', error);
      throw new InternalServerErrorException('Failed to connect to Firestore');
    }
  }

  private ensureFirestoreInitialized(): void {
    if (!this.firestore) {
      this.logger.error('Firestore client is not initialized. This might be due to an error during service construction.');
      throw new InternalServerErrorException('Firestore client is not initialized. Cannot process prompt template requests.');
    }
  }

  async getPrompt(type: string, customId?: string): Promise<string> {
    this.ensureFirestoreInitialized();
    try {
      let query = this.firestore.collection(this.collectionName).where('type', '==', type);
      
      if (customId) {
        query = this.firestore.collection(this.collectionName).where('id', '==', customId);
      }
      
      const snapshot = await query.limit(1).get();
      
      if (snapshot.empty) {
        this.logger.warn(`Prompt template for type '${type}' not found.`);
        throw new NotFoundException(`Prompt template for type '${type}' not found.`);
      }
      
      const doc = snapshot.docs[0];
      return doc.get('prompt');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const originalErrorMessage = error instanceof Error ? error.message : String(error);
      const stackTrace = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error retrieving prompt template for type '${type}': ${originalErrorMessage}`, stackTrace);
      throw new InternalServerErrorException(`Failed to retrieve prompt template. Original error: ${originalErrorMessage}`);
    }
  }

  async getAllPromptTemplates(): Promise<any[]> {
    this.ensureFirestoreInitialized();
    try {
      const snapshot = await this.firestore.collection(this.collectionName).get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      const originalErrorMessage = error instanceof Error ? error.message : String(error);
      const stackTrace = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error retrieving all prompt templates: ${originalErrorMessage}`, stackTrace);
      throw new InternalServerErrorException(`Failed to retrieve all prompt templates. Original error: ${originalErrorMessage}`);
    }
  }

  async getPromptTemplatesByType(type: PromptType): Promise<any[]> {
    this.ensureFirestoreInitialized();
    try {
      const snapshot = await this.firestore.collection(this.collectionName)
        .where('type', '==', type)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      const originalErrorMessage = error instanceof Error ? error.message : String(error);
      const stackTrace = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error retrieving prompt templates for type '${type}': ${originalErrorMessage}`, stackTrace);
      throw new InternalServerErrorException(`Failed to retrieve prompt templates for type '${type}'. Original error: ${originalErrorMessage}`);
    }
  }

  async getPromptTemplateById(id: string): Promise<any> {
    this.ensureFirestoreInitialized();
    try {
      const docRef = this.firestore.collection(this.collectionName).doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new NotFoundException(`Prompt template with ID '${id}' not found.`);
      }
      
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const originalErrorMessage = error instanceof Error ? error.message : String(error);
      const stackTrace = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error retrieving prompt template with ID '${id}': ${originalErrorMessage}`, stackTrace);
      throw new InternalServerErrorException(`Failed to retrieve prompt template with ID '${id}'. Original error: ${originalErrorMessage}`);
    }
  }

  async createPromptTemplate(createPromptDto: CreatePromptTemplateDto): Promise<any> {
    this.ensureFirestoreInitialized();
    try {
      // Check if a template with the same name already exists
      const nameSnapshot = await this.firestore.collection(this.collectionName)
        .where('name', '==', createPromptDto.name)
        .limit(1)
        .get();
      
      if (!nameSnapshot.empty) {
        throw new ConflictException(`A prompt template with name '${createPromptDto.name}' already exists.`);
      }
      
      const id = uuidv4();
      const templateData = {
        id,
        ...createPromptDto,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await this.firestore.collection(this.collectionName).doc(id).set(templateData);
      
      return templateData;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      const originalErrorMessage = error instanceof Error ? error.message : String(error);
      const stackTrace = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error creating prompt template: ${originalErrorMessage}`, stackTrace);
      throw new InternalServerErrorException(`Failed to create prompt template. Original error: ${originalErrorMessage}`);
    }
  }

  async updatePromptTemplate(id: string, updatePromptDto: UpdatePromptTemplateDto): Promise<any> {
    this.ensureFirestoreInitialized();
    try {
      const docRef = this.firestore.collection(this.collectionName).doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new NotFoundException(`Prompt template with ID '${id}' not found.`);
      }
      
      if (updatePromptDto.name) {
        // Check if the new name conflicts with existing templates (except this one)
        const nameSnapshot = await this.firestore.collection(this.collectionName)
          .where('name', '==', updatePromptDto.name)
          .get();
          
        const conflicts = nameSnapshot.docs.filter(d => d.id !== id);
        if (conflicts.length > 0) {
          throw new ConflictException(`A prompt template with name '${updatePromptDto.name}' already exists.`);
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
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      const originalErrorMessage = error instanceof Error ? error.message : String(error);
      const stackTrace = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error updating prompt template with ID '${id}': ${originalErrorMessage}`, stackTrace);
      throw new InternalServerErrorException(`Failed to update prompt template with ID '${id}'. Original error: ${originalErrorMessage}`);
    }
  }

  async deletePromptTemplate(id: string): Promise<void> {
    this.ensureFirestoreInitialized();
    try {
      const docRef = this.firestore.collection(this.collectionName).doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new NotFoundException(`Prompt template with ID '${id}' not found.`);
      }
      
      await docRef.delete();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const originalErrorMessage = error instanceof Error ? error.message : String(error);
      const stackTrace = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error deleting prompt template with ID '${id}': ${originalErrorMessage}`, stackTrace);
      throw new InternalServerErrorException(`Failed to delete prompt template with ID '${id}'. Original error: ${originalErrorMessage}`);
    }
  }
}