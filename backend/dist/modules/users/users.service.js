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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const firestore_1 = require("@google-cloud/firestore");
const config_1 = require("@nestjs/config");
let UsersService = class UsersService {
    constructor(configService) {
        this.configService = configService;
        this.collectionName = 'users';
    }
    async onModuleInit() {
        const projectId = this.configService.get('GCS_PROJECT_ID');
        const databaseId = this.configService.get('FIRESTORE_DATABASE_ID');
        if (!projectId) {
            throw new common_1.InternalServerErrorException('Missing GCS_PROJECT_ID environment variable for Firestore.');
        }
        if (!databaseId) {
            throw new common_1.InternalServerErrorException('Missing FIRESTORE_DATABASE_ID environment variable for Firestore.');
        }
        this.firestore = new firestore_1.Firestore({
            projectId,
            databaseId,
        });
        console.log(`Firestore Project ID being used: ${projectId}, Database ID: ${databaseId}`);
    }
    async findOne(username) {
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
        }
        catch (error) {
            console.error(`[UsersService] Error in findOne for username ${username}:`, error);
            throw error;
        }
    }
    async findById(id) {
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
    async create(user) {
        const docRef = await this.firestore.collection(this.collectionName).add(user);
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() };
    }
    async update(id, update) {
        await this.firestore.collection(this.collectionName).doc(id).update(update);
        return this.findById(id);
    }
    async delete(id) {
        await this.firestore.collection(this.collectionName).doc(id).delete();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UsersService);
