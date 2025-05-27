import { Injectable, NotFoundException, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService implements OnModuleInit {
  private firestore: Firestore;
  private collectionName = 'users';

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const projectId = this.configService.get<string>('GCS_PROJECT_ID');
    const databaseId = this.configService.get<string>('FIRESTORE_DATABASE_ID');

    if (!projectId) {
       throw new InternalServerErrorException('Missing GCS_PROJECT_ID environment variable for Firestore.');
    }
    if (!databaseId) {
      // Default to '(default)' if not specified, or throw an error if it's required
      // For now, let's make it explicit and require it for clarity, matching the seed script.
      throw new InternalServerErrorException('Missing FIRESTORE_DATABASE_ID environment variable for Firestore.');
    }

    this.firestore = new Firestore({
      projectId,
      databaseId,
    });

    console.log(`Firestore Project ID being used: ${projectId}, Database ID: ${databaseId}`);
  }

  async findOne(username: string): Promise<any | undefined> {
    console.log(`[UsersService] findOne called with username: ${username}`);
    try {
      const snapshot = await this.firestore.collection(this.collectionName).where('username', '==', username).limit(1).get();
      console.log(`[UsersService] findOne - snapshot.empty for username ${username}: ${snapshot.empty}`);
      if (snapshot.empty) {
        console.log(`[UsersService] findOne - User with username ${username} not found.`);
      return undefined;
    }
      const userDoc = snapshot.docs[0];
      console.log(`[UsersService] findOne - User found for username ${username}:`, { id: userDoc.id, ...userDoc.data() });
      return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
      console.error(`[UsersService] Error in findOne for username ${username}:`, error);
      // Re-throw the error to be handled by NestJS global exception filter or calling service
      throw error;
    }
  }

  async findById(id: string): Promise<any | undefined> {
    console.log(`[UsersService] findById called with id: ${id}`);
    const doc = await this.firestore.collection(this.collectionName).doc(id).get();
    console.log(`[UsersService] findById - doc.exists for id ${id}: ${doc.exists}`);
    if (!doc.exists) {
      console.log(`[UsersService] findById - Document with id ${id} does not exist.`);
      return undefined;
    }
    console.log(`[UsersService] findById - Document data for id ${id}:`, doc.data());
    return { id: doc.id, ...doc.data() };
  }

  async create(user: any): Promise<any> {
    const docRef = await this.firestore.collection(this.collectionName).add(user);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  }

  async update(id: string, update: any): Promise<any> {
    await this.firestore.collection(this.collectionName).doc(id).update(update);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.firestore.collection(this.collectionName).doc(id).delete();
  }
}
