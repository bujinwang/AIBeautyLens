import { Injectable, NotFoundException, InternalServerErrorException, ConflictException, Logger } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import { CreatePromptTemplateDto, UpdatePromptTemplateDto, PromptType } from './dto/prompt-template.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PromptTemplateService {
  private firestore: Firestore;
  private collectionName = 'promptTemplates';
  private readonly logger = new Logger(PromptTemplateService.name);

  constructor() {
    try {
      this.firestore = new Firestore();
      this.logger.log('Firestore connection initialized for prompt templates');
    } catch (error) {
      this.logger.error('Failed to initialize Firestore connection', error);
      throw new InternalServerErrorException('Failed to connect to Firestore');
    }
  }

  async getPrompt(type: string, customId?: string): Promise<string> {
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
      this.logger.error(`Error retrieving prompt template for type '${type}'`, error);
      throw new InternalServerErrorException('Failed to retrieve prompt template');
    }
  }

  async getAllPromptTemplates(): Promise<any[]> {
    try {
      const snapshot = await this.firestore.collection(this.collectionName).get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      this.logger.error('Error retrieving all prompt templates', error);
      throw new InternalServerErrorException('Failed to retrieve prompt templates');
    }
  }

  async getPromptTemplatesByType(type: PromptType): Promise<any[]> {
    try {
      const snapshot = await this.firestore.collection(this.collectionName)
        .where('type', '==', type)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      this.logger.error(`Error retrieving prompt templates for type '${type}'`, error);
      throw new InternalServerErrorException('Failed to retrieve prompt templates');
    }
  }

  async getPromptTemplateById(id: string): Promise<any> {
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
      this.logger.error(`Error retrieving prompt template with ID '${id}'`, error);
      throw new InternalServerErrorException('Failed to retrieve prompt template');
    }
  }

  async createPromptTemplate(createPromptDto: CreatePromptTemplateDto): Promise<any> {
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
      this.logger.error('Error creating prompt template', error);
      throw new InternalServerErrorException('Failed to create prompt template');
    }
  }

  async updatePromptTemplate(id: string, updatePromptDto: UpdatePromptTemplateDto): Promise<any> {
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
      this.logger.error(`Error updating prompt template with ID '${id}'`, error);
      throw new InternalServerErrorException('Failed to update prompt template');
    }
  }

  async deletePromptTemplate(id: string): Promise<void> {
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
      this.logger.error(`Error deleting prompt template with ID '${id}'`, error);
      throw new InternalServerErrorException('Failed to delete prompt template');
    }
  }
} 