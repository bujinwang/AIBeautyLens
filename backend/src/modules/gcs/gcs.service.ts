import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GcsService {
  private storage: Storage;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('GCS_BUCKET_NAME')!;
    const projectId = this.configService.get<string>('GCS_PROJECT_ID')!;
    const clientEmail = this.configService.get<string>('GCS_CLIENT_EMAIL')!;
    const privateKey = this.configService.get<string>('GCS_PRIVATE_KEY')!;

    if (!this.bucketName || !projectId || !clientEmail || !privateKey) {
      throw new InternalServerErrorException('Missing GCS configuration environment variables.');
    }

    this.storage = new Storage({
      projectId,
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'), // Handle private key with escaped newlines
      },
    });
  }

  async generateSignedUrl(filename: string, fileExtension: string): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(`${filename}.${fileExtension}`);

    const options = {
      version: 'v4' as 'v4',
      action: 'write' as 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: `image/${fileExtension}`, // Assuming image uploads for now
    };

    try {
      const [url] = await file.getSignedUrl(options);
      return url;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new InternalServerErrorException('Could not generate signed URL for upload.');
    }
  }
}
