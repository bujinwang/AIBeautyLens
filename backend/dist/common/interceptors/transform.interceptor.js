"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TransformInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let TransformInterceptor = TransformInterceptor_1 = class TransformInterceptor {
    constructor() {
        this.logger = new common_1.Logger(TransformInterceptor_1.name);
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { url, method } = request;
        const now = Date.now();
        return next.handle().pipe((0, operators_1.map)((data) => {
            const response = context.switchToHttp().getResponse();
            const contentType = response.getHeader('Content-Type');
            if (contentType &&
                (contentType.includes('octet-stream') ||
                    contentType.includes('application/pdf') ||
                    contentType.includes('image/'))) {
                return data;
            }
            const statusCode = response.statusCode;
            if (statusCode >= 300 && statusCode < 400) {
                return data;
            }
            return {
                statusCode,
                timestamp: new Date().toISOString(),
                path: url,
                method,
                data: this.extractData(data),
                message: this.extractMessage(data),
            };
        }), (0, operators_1.tap)(() => {
            const responseTime = Date.now() - now;
            if (responseTime > 1000) {
                this.logger.warn(`Slow response: [${method}] ${url} - ${responseTime}ms`);
            }
            else {
                this.logger.log(`[${method}] ${url} - ${responseTime}ms`);
            }
        }));
    }
    extractData(response) {
        if (response && typeof response === 'object' && 'data' in response) {
            return response.data;
        }
        if (response &&
            typeof response === 'object' &&
            'success' in response &&
            'message' in response &&
            Object.keys(response).length === 2) {
            return {};
        }
        return response;
    }
    extractMessage(response) {
        if (response && typeof response === 'object' && 'message' in response) {
            return response.message;
        }
        return undefined;
    }
};
exports.TransformInterceptor = TransformInterceptor;
exports.TransformInterceptor = TransformInterceptor = TransformInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], TransformInterceptor);
