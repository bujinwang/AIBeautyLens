import { Injectable, NotFoundException } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';

@Injectable()
export class PromptTemplateService {
  private firestore: Firestore;
  private collectionName = 'promptTemplates';

  constructor() {
    this.firestore = new Firestore();
  }

  async getPrompt(type: string): Promise<string> {
    const snapshot = await this.firestore.collection(this.collectionName).where('type', '==', type).limit(1).get();
    if (snapshot.empty) {
      throw new NotFoundException(`Prompt template for type '${type}' not found.`);
    }
    const doc = snapshot.docs[0];
    return doc.get('prompt');
  }
} 