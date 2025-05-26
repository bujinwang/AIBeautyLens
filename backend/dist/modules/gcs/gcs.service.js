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
exports.GcsService = void 0;
const common_1 = require("@nestjs/common");
const storage_1 = require("@google-cloud/storage");
const config_1 = require("@nestjs/config");
const google_auth_library_1 = require("google-auth-library");
let GcsService = class GcsService {
    constructor(configService) {
        this.configService = configService;
        this.bucketName = this.configService.get('GCS_BUCKET_NAME');
        const projectId = this.configService.get('GCS_PROJECT_ID');
        this.signingServiceAccountEmail = this.configService.get('GCS_SIGNING_SERVICE_ACCOUNT_EMAIL');
        if (!this.bucketName || !projectId) {
            throw new common_1.InternalServerErrorException('Missing GCS_BUCKET_NAME or GCS_PROJECT_ID environment variables.');
        }
        if (!this.signingServiceAccountEmail) {
            console.warn('GCS_SIGNING_SERVICE_ACCOUNT_EMAIL is not set. Signed URL generation might fail if ADC does not resolve to a service account with signing permissions.');
        }
        const auth = new google_auth_library_1.GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/devstorage.full_control'],
            projectId,
        });
        this.storage = new storage_1.Storage({
            authClient: auth,
            projectId,
        });
    }
    async generateSignedUrl(filename, fileExtension) {
        const bucket = this.storage.bucket(this.bucketName);
        const file = bucket.file(`${filename}.${fileExtension}`);
        const options = {
            version: 'v4',
            action: 'write',
            expires: Date.now() + 15 * 60 * 1000,
            contentType: `image/${fileExtension}`,
        };
        if (this.signingServiceAccountEmail) {
            options.serviceAccount = this.signingServiceAccountEmail;
        }
        else {
            console.warn('Attempting to generate signed URL without an explicit GCS_SIGNING_SERVICE_ACCOUNT_EMAIL. ' +
                'This may fail if Application Default Credentials (ADC) do not resolve to a service account ' +
                'with appropriate signing permissions (e.g., if ADC is using user credentials locally).');
        }
        console.log('GCS Signed URL Options:', JSON.stringify(options, null, 2));
        try {
            const [url] = await file.getSignedUrl(options);
            return url;
        }
        catch (error) {
            console.error('Error generating signed URL:', error);
            throw new common_1.InternalServerErrorException('Could not generate signed URL for upload.');
        }
    }
};
exports.GcsService = GcsService;
exports.GcsService = GcsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GcsService);
