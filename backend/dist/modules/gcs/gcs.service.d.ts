import { ConfigService } from '@nestjs/config';
export declare class GcsService {
    private configService;
    private storage;
    private bucketName;
    private signingServiceAccountEmail?;
    constructor(configService: ConfigService);
    generateSignedUrl(filename: string, fileExtension: string): Promise<string>;
}
