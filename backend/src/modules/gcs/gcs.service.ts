import { Injectable, InternalServerErrorException, OnModuleInit, Logger, BadRequestException } from '@nestjs/common';
import { execSync } from 'child_process';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import { GoogleAuth } from 'google-auth-library';
import * as rateLimit from 'express-rate-limit';

@Injectable()
export class GcsService implements OnModuleInit {
  private storage: Storage;
  private bucketName: string;
  private signingServiceAccountEmail?: string;
  private readonly logger = new Logger(GcsService.name);
  private rateLimiter: any;
  private isDevelopment: boolean;
  private useDummyStorage: boolean = false;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('GCS_BUCKET_NAME')!;
    this.signingServiceAccountEmail = this.configService.get<string>('GCS_SIGNING_SERVICE_ACCOUNT_EMAIL');
    this.isDevelopment = this.configService.get<string>('NODE_ENV') !== 'production';
    
    // Initialize rate limiter
    this.rateLimiter = rateLimit.rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false, // Count successful requests against the rate limit
      keyGenerator: (req) => req.ip || 'unknown', // Use IP as the key
      handler: (_, __, ___, options) => {
        throw new BadRequestException(`Too many requests, please try again after ${options.windowMs / 60000} minutes`);
      },
    });
  }

  async onModuleInit() {
    const projectId = this.configService.get<string>('GCS_PROJECT_ID')!;

    if (!this.bucketName || !projectId) {
      this.logger.error('Missing required environment variables: GCS_BUCKET_NAME or GCS_PROJECT_ID');
      throw new InternalServerErrorException('Missing GCS_BUCKET_NAME or GCS_PROJECT_ID environment variables.');
    }
    
    try {
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/devstorage.full_control'],
      projectId,
    });

    // Initialize the GoogleAuth instance.
    // We will pass this 'auth' object to the Storage constructor.
    // Calling getClient() here helps ensure ADC is loaded and potentially primes the auth object.
    const authClientInstance = await auth.getClient();
    const authClientType = authClientInstance?.constructor?.name || 'unknown';
    this.logger.log('AuthClient type resolved by auth.getClient():', authClientType);

    // Check credentials on the resolved client for logging purposes
    const resolvedClientEmail = (authClientInstance?.credentials as any)?.client_email;
    const resolvedPrivateKey = (authClientInstance?.credentials as any)?.private_key;

    if (resolvedClientEmail && resolvedPrivateKey) {
      this.logger.log('Resolved AuthClient email (for signing):', resolvedClientEmail);
    } else {
      this.logger.warn(
        'Resolved AuthClient does not have client_email and private_key. ' +
        'This is expected if using user Application Default Credentials (ADC) locally. ' +
        'Direct signing of URLs with user ADC is not supported by google-auth-library. ' +
        'Ensure GCS_SIGNING_SERVICE_ACCOUNT_EMAIL is set and your user account has ' +
        'the "Service Account Token Creator" role on that service account for impersonation to work.'
      );
    }

    // Reverting to implicit ADC for Storage client initialization.
    // Attempts to explicitly pass auth context (GoogleAuth or AuthClient instances)
    // did not resolve the "Cannot sign data without client_email" error when using
    // user ADC with impersonation for signed URLs, and sometimes led to other issues.
    // This aligns with known challenges for local development.
    this.storage = new Storage({
      projectId,
    });
    this.logger.log('Storage client initialized to use implicit Application Default Credentials.');
    } catch (error) {
      if (this.isDevelopment) {
        this.logger.warn('Failed to initialize GCS in development environment. Using dummy storage instead.');
        this.logger.warn('Error was:', error);
        this.useDummyStorage = true;
        this.storage = new Storage(); // Create a dummy storage object
      } else {
        // In production, we want to fail if GCS can't be initialized
        throw error;
      }
    }
  }

  /**
   * Apply rate limiting to the request
   * @param ip - The IP address of the requester
   */
  private async applyRateLimit(ip: string): Promise<void> {
    // Create a mock request and response object for the rate limiter
    const req = { ip };
    const res = {
      setHeader: () => {},
      status: () => ({ json: () => {} }),
    };
    
    // Apply rate limiting
    return new Promise((resolve, reject) => {
      this.rateLimiter(req, res, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Generate a signed URL for uploading a file to GCS
   * @param filename - The base filename
   * @param fileExtension - The file extension
   * @param expirationMinutes - URL expiration time in minutes (default: 15)
   * @param ip - The IP address of the requester for rate limiting
   * @returns The signed URL
   */
  async generateSignedUrl(
    filename: string, 
    fileExtension: string, 
    expirationMinutes: number = 15,
    ip: string = 'unknown'
  ): Promise<string> {
    // Apply rate limiting
    try {
      await this.applyRateLimit(ip);
    } catch (error) {
      this.logger.warn(`Rate limit exceeded for IP: ${ip}`);
      throw error;
    }

    // If we're using dummy storage in development, return a fake URL
    if (this.useDummyStorage) {
      this.logger.log(`Generating fake signed URL for ${filename}.${fileExtension} in development mode`);
      return `https://storage.googleapis.com/${this.bucketName}/${filename}.${fileExtension}?fakeSignedUrl=true`;
    }

    // Validate expiration time
    if (expirationMinutes < 1 || expirationMinutes > 60) {
      this.logger.warn(`Invalid expiration time: ${expirationMinutes} minutes. Must be between 1 and 60.`);
      throw new BadRequestException('Expiration time must be between 1 and 60 minutes');
    }

    const objectName = `${filename}.${fileExtension}`;
    const contentType = `image/${fileExtension}`;

    // Log the request
    this.logger.log(`Generating signed URL for ${objectName} with expiration: ${expirationMinutes} minutes`);

    // Use @google-cloud/storage for signed URL generation in all environments
    this.logger.log('Using @google-cloud/storage for signed URL generation.');
    if (!this.storage) {
      throw new InternalServerErrorException('GCS Service not initialized.');
    }

    const file = this.storage.bucket(this.bucketName).file(objectName);
    const options: any = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + expirationMinutes * 60 * 1000, // Convert minutes to milliseconds
      contentType: contentType,
    };

    if (this.signingServiceAccountEmail) {
      options.serviceAccount = this.signingServiceAccountEmail; // For v4, serviceAccount is used for impersonation with @google-cloud/storage
      this.logger.log(`Using serviceAccount for impersonation: ${this.signingServiceAccountEmail}`);
    } else {
      this.logger.warn(
        'GCS_SIGNING_SERVICE_ACCOUNT_EMAIL is not set. Signed URL will be generated using the default credentials of the environment.',
      );
    }
    
    this.logger.debug('GCS Signed URL Options for @google-cloud/storage:', JSON.stringify(options, null, 2));

    try {
      const [url] = await file.getSignedUrl(options);
      this.logger.log('Successfully generated signed URL using @google-cloud/storage.');
      return url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Error generating signed URL with @google-cloud/storage:', error); // Log the original error object
      throw new InternalServerErrorException(`Could not generate signed URL: ${errorMessage}`);
    }
  }

  /**
   * Log a successful upload event
   * @param objectName - The name of the uploaded object
   * @param ip - The IP address of the uploader
   */
  async logSuccessfulUpload(objectName: string, ip: string = 'unknown'): Promise<void> {
    this.logger.log(`Successful upload: ${objectName} from IP: ${ip}`);
    // In a real implementation, you might want to store this in a database or monitoring system
  }

  /**
   * Log a failed upload event
   * @param objectName - The name of the object that failed to upload
   * @param error - The error that occurred
   * @param ip - The IP address of the uploader
   */
  async logFailedUpload(objectName: string, error: any, ip: string = 'unknown'): Promise<void> {
    this.logger.error(`Failed upload: ${objectName} from IP: ${ip}`, error);
    // In a real implementation, you might want to store this in a database or monitoring system
    // and potentially trigger alerts
  }
}
