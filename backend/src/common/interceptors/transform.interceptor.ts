import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Request } from 'express';

export interface ResponseData<T> {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  data: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseData<T>> {
  private readonly logger = new Logger(TransformInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseData<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const { url, method } = request;
    const now = Date.now();

    return next.handle().pipe(
      map((data) => {
        // Don't transform streaming responses or file downloads
        const response = context.switchToHttp().getResponse();
        const contentType = response.getHeader('Content-Type');
        if (contentType && 
            (contentType.includes('octet-stream') || 
             contentType.includes('application/pdf') ||
             contentType.includes('image/'))) {
          return data;
        }

        // For redirect responses, don't transform
        const statusCode = response.statusCode;
        if (statusCode >= 300 && statusCode < 400) {
          return data;
        }

        // Transform the response for standard API calls
        return {
          statusCode,
          timestamp: new Date().toISOString(),
          path: url,
          method,
          data: this.extractData(data),
          message: this.extractMessage(data),
        };
      }),
      tap(() => {
        // Log response time for performance monitoring
        const responseTime = Date.now() - now;
        if (responseTime > 1000) { // Log slow responses (>1s)
          this.logger.warn(`Slow response: [${method}] ${url} - ${responseTime}ms`);
        } else {
          this.logger.log(`[${method}] ${url} - ${responseTime}ms`);
        }
      }),
    );
  }

  private extractData(response: any): any {
    // If the response has a data property, return it
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data;
    }
    
    // If the response has a success and message property only, return empty object
    if (response && 
        typeof response === 'object' && 
        'success' in response && 
        'message' in response && 
        Object.keys(response).length === 2) {
      return {};
    }
    
    // Otherwise return the whole response
    return response;
  }

  private extractMessage(response: any): string | undefined {
    if (response && typeof response === 'object' && 'message' in response) {
      return response.message as string;
    }
    return undefined;
  }
} 