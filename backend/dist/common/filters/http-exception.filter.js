"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let errorMessage;
        if (exception instanceof common_1.HttpException) {
            const exceptionResponse = exception.getResponse();
            errorMessage =
                typeof exceptionResponse === 'object' && 'message' in exceptionResponse
                    ? exceptionResponse.message
                    : exception.message;
        }
        else {
            errorMessage = exception?.message || 'Internal server error';
        }
        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message: errorMessage,
        };
        if (!(exception instanceof common_1.HttpException)) {
            errorResponse.error = exception?.name || 'InternalServerError';
        }
        if (process.env.NODE_ENV !== 'production' && exception?.stack) {
            errorResponse.stackTrace = exception.stack;
        }
        if (status >= 500) {
            this.logger.error(`[${request.method}] ${request.url} - ${status}`, exception?.stack, 'GlobalExceptionFilter');
        }
        else if (status >= 400) {
            this.logger.warn(`[${request.method}] ${request.url} - ${status} - ${errorMessage}`, 'GlobalExceptionFilter');
        }
        response.status(status).json(errorResponse);
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
