import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  constructor(private configService: ConfigService) {
    super();
  }

  protected getTracker(req: Record<string, any>): string {
    // Use X-Forwarded-For header if available (e.g., when behind a proxy like Nginx, Cloudflare, etc.)
    // Otherwise, fall back to the direct IP address
    return req.ips.length ? req.ips[0] : req.ip;
  }
}
