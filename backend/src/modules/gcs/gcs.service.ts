import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import { GoogleAuth } from 'google-auth-library';

@Injectable()
export class GcsService implements OnModuleInit {
  private storage: Storage;
  private bucketName: string;
  private signingServiceAccountEmail?: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('GCS_BUCKET_NAME')!;
    this.signingServiceAccountEmail = this.configService.get<string>('GCS_SIGNING_SERVICE_ACCOUNT_EMAIL');
  }

  async onModuleInit() {
    const projectId = this.configService.get<string>('GCS_PROJECT_ID')!;

    if (!this.bucketName || !projectId) {
      throw new InternalServerErrorException('Missing GCS_BUCKET_NAME or GCS_PROJECT_ID environment variables.');
    }
    
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/devstorage.full_control'],
      projectId,
    });

    const client = await auth.getClient();
    // Check if the client has credentials that can be used for signing (i.e., a service account)
    // The client.credentials object might not always have client_email or private_key,
    // especially for user accounts or certain ADC configurations.
    // We check for the presence of these properties before accessing them.
    const clientEmail = (client.credentials as any)?.client_email;
    const privateKey = (client.credentials as any)?.private_key;

    if (clientEmail && privateKey) {
      console.log('AuthClient email (for signing):', clientEmail);
    } else {
      console.warn(
        'AuthClient does not have client_email and private_key. ' +
        'This is expected if using user Application Default Credentials (ADC) locally. ' +
        'Direct signing of URLs with user ADC is not supported by google-auth-library. ' +
        'Ensure GCS_SIGNING_SERVICE_ACCOUNT_EMAIL is set and your user account has ' +
        'the "Service Account Token Creator" role on that service account for impersonation to work.'
      );
    }
    console.log('AuthClient type:', client.constructor.name);

    this.storage = new Storage({
      authClient: client,
      projectId,
    });
  }

  async generateSignedUrl(filename: string, fileExtension: string): Promise<string> {
    if (!this.storage) {
      throw new InternalServerErrorException('GCS Service not initialized.');
    }

    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(`${filename}.${fileExtension}`);

    const options: any = { // Changed type to any for diagnostics
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: `image/${fileExtension}`, // Assuming image uploads for now
    };

    if (this.signingServiceAccountEmail) {
      options.signerEmail = this.signingServiceAccountEmail;
    } else {
      console.warn(
        'GCS_SIGNING_SERVICE_ACCOUNT_EMAIL is not set. Signed URL generation might fail if Application Default Credentials (ADC) ' +
        'do not resolve to a service account with appropriate signing permissions (e.g., if ADC is using user credentials locally). ' +
        'Consider setting GCS_SIGNING_SERVICE_ACCOUNT_EMAIL for local development with user ADC.'
      );
    }
    
    console.log('GCS Signed URL Options:', JSON.stringify(options, null, 2)); // Log the options

    try {
      const [url] = await file.getSignedUrl(options);
      return url;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new InternalServerErrorException('Could not generate signed URL for upload.');
    }
  }
}
