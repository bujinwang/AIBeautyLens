import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
  stackTrace?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Determine status code and error message
    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    
    let errorMessage: string | string[];
    
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      errorMessage = 
        typeof exceptionResponse === 'object' && 'message' in exceptionResponse
          ? (exceptionResponse as any).message
          : exception.message;
    } else {
      errorMessage = exception?.message || 'Internal server error';
    }

    // Create consistent error response
    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorMessage,
    };

    // Add error name for non-HTTP exceptions
    if (!(exception instanceof HttpException)) {
      errorResponse.error = exception?.name || 'InternalServerError';
    }

    // Add stack trace in development environment
    if (process.env.NODE_ENV !== 'production' && exception?.stack) {
      errorResponse.stackTrace = exception.stack;
    }

    // Log the error with appropriate level based on status code
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${status}`,
        exception?.stack,
        'GlobalExceptionFilter'
      );
    } else if (status >= 400) {
      this.logger.warn(
        `[${request.method}] ${request.url} - ${status} - ${errorMessage}`,
        'GlobalExceptionFilter'
      );
    }

    // Send response to client
    response.status(status).json(errorResponse);
  }
} 