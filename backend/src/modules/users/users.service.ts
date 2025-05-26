import { Injectable, NotFoundException } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';

@Injectable()
export class UsersService {
  private firestore: Firestore;
  private collectionName = 'users';

  constructor() {
    this.firestore = new Firestore();
  }

  async findOne(username: string): Promise<any | undefined> {
    const snapshot = await this.firestore.collection(this.collectionName).where('username', '==', username).limit(1).get();
    if (snapshot.empty) return undefined;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }

  async findById(id: string): Promise<any | undefined> {
    const doc = await this.firestore.collection(this.collectionName).doc(id).get();
    if (!doc.exists) return undefined;
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
