import { GcsService } from './gcs.service';
import { GenerateSignedUrlDto } from './dto/generate-signed-url.dto';
export declare class GcsController {
    private readonly gcsService;
    constructor(gcsService: GcsService);
    generateSignedUrl(generateSignedUrlDto: GenerateSignedUrlDto): Promise<{
        url: string;
    }>;
}
