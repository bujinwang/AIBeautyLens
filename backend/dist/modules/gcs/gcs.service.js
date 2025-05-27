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
var GcsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GcsService = void 0;
const common_1 = require("@nestjs/common");
const storage_1 = require("@google-cloud/storage");
const config_1 = require("@nestjs/config");
const google_auth_library_1 = require("google-auth-library");
const rateLimit = __importStar(require("express-rate-limit"));
let GcsService = GcsService_1 = class GcsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(GcsService_1.name);
        this.bucketName = this.configService.get('GCS_BUCKET_NAME');
        this.signingServiceAccountEmail = this.configService.get('GCS_SIGNING_SERVICE_ACCOUNT_EMAIL');
        this.rateLimiter = rateLimit.rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 100,
            standardHeaders: true,
            legacyHeaders: false,
            skipSuccessfulRequests: false,
            keyGenerator: (req) => req.ip || 'unknown',
            handler: (_, __, ___, options) => {
                throw new common_1.BadRequestException(`Too many requests, please try again after ${options.windowMs / 60000} minutes`);
            },
        });
    }
    async onModuleInit() {
        const projectId = this.configService.get('GCS_PROJECT_ID');
        if (!this.bucketName || !projectId) {
            this.logger.error('Missing required environment variables: GCS_BUCKET_NAME or GCS_PROJECT_ID');
            throw new common_1.InternalServerErrorException('Missing GCS_BUCKET_NAME or GCS_PROJECT_ID environment variables.');
        }
        const auth = new google_auth_library_1.GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/devstorage.full_control'],
            projectId,
        });
        const authClientInstance = await auth.getClient();
        const authClientType = authClientInstance?.constructor?.name || 'unknown';
        this.logger.log('AuthClient type resolved by auth.getClient():', authClientType);
        const resolvedClientEmail = authClientInstance?.credentials?.client_email;
        const resolvedPrivateKey = authClientInstance?.credentials?.private_key;
        if (resolvedClientEmail && resolvedPrivateKey) {
            this.logger.log('Resolved AuthClient email (for signing):', resolvedClientEmail);
        }
        else {
            this.logger.warn('Resolved AuthClient does not have client_email and private_key. ' +
                'This is expected if using user Application Default Credentials (ADC) locally. ' +
                'Direct signing of URLs with user ADC is not supported by google-auth-library. ' +
                'Ensure GCS_SIGNING_SERVICE_ACCOUNT_EMAIL is set and your user account has ' +
                'the "Service Account Token Creator" role on that service account for impersonation to work.');
        }
        this.storage = new storage_1.Storage({
            projectId,
        });
        this.logger.log('Storage client initialized to use implicit Application Default Credentials.');
    }
    async applyRateLimit(ip) {
        const req = { ip };
        const res = {
            setHeader: () => { },
            status: () => ({ json: () => { } }),
        };
        return new Promise((resolve, reject) => {
            this.rateLimiter(req, res, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async generateSignedUrl(filename, fileExtension, expirationMinutes = 15, ip = 'unknown') {
        try {
            await this.applyRateLimit(ip);
        }
        catch (error) {
            this.logger.warn(`Rate limit exceeded for IP: ${ip}`);
            throw error;
        }
        if (expirationMinutes < 1 || expirationMinutes > 60) {
            this.logger.warn(`Invalid expiration time: ${expirationMinutes} minutes. Must be between 1 and 60.`);
            throw new common_1.BadRequestException('Expiration time must be between 1 and 60 minutes');
        }
        const objectName = `${filename}.${fileExtension}`;
        const contentType = `image/${fileExtension}`;
        this.logger.log(`Generating signed URL for ${objectName} with expiration: ${expirationMinutes} minutes`);
        this.logger.log('Using @google-cloud/storage for signed URL generation.');
        if (!this.storage) {
            throw new common_1.InternalServerErrorException('GCS Service not initialized.');
        }
        const file = this.storage.bucket(this.bucketName).file(objectName);
        const options = {
            version: 'v4',
            action: 'write',
            expires: Date.now() + expirationMinutes * 60 * 1000,
            contentType: contentType,
        };
        if (this.signingServiceAccountEmail) {
            options.serviceAccount = this.signingServiceAccountEmail;
            this.logger.log(`Using serviceAccount for impersonation: ${this.signingServiceAccountEmail}`);
        }
        else {
            this.logger.warn('GCS_SIGNING_SERVICE_ACCOUNT_EMAIL is not set. Signed URL will be generated using the default credentials of the environment.');
        }
        this.logger.debug('GCS Signed URL Options for @google-cloud/storage:', JSON.stringify(options, null, 2));
        try {
            const [url] = await file.getSignedUrl(options);
            this.logger.log('Successfully generated signed URL using @google-cloud/storage.');
            return url;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('Error generating signed URL with @google-cloud/storage:', error);
            throw new common_1.InternalServerErrorException(`Could not generate signed URL: ${errorMessage}`);
        }
    }
    async logSuccessfulUpload(objectName, ip = 'unknown') {
        this.logger.log(`Successful upload: ${objectName} from IP: ${ip}`);
    }
    async logFailedUpload(objectName, error, ip = 'unknown') {
        this.logger.error(`Failed upload: ${objectName} from IP: ${ip}`, error);
    }
};
exports.GcsService = GcsService;
exports.GcsService = GcsService = GcsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GcsService);
