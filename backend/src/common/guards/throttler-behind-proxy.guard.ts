import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModuleOptions } from '@nestjs/throttler';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Inject } from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  constructor(
    @Inject('THROTTLER:MODULE_OPTIONS')
    protected readonly options: ThrottlerModuleOptions,
    @Inject('ThrottlerStorage')
    protected readonly storageService,
    protected readonly reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  // Override to get the client IP behind a proxy
  protected getTracker(context: ExecutionContext): Promise<string> {
    const request = context.switchToHttp().getRequest();
    // Use X-Forwarded-For header if available
    const ip = request.ips?.length ? request.ips[0] : request.ip;
    return Promise.resolve(ip);
  }
}
