"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const logging_service_1 = require("./common/services/logging.service");
const admin = __importStar(require("firebase-admin"));
const bodyParser = __importStar(require("body-parser"));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
async function bootstrap() {
    try {
        try {
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
            console.log('[Bootstrap] Firebase Admin SDK initialized successfully with application default credentials.');
        }
        catch (defaultCredError) {
            console.log('[Bootstrap] Failed to initialize with application default credentials, trying default initialization...');
            admin.initializeApp();
            console.log('[Bootstrap] Firebase Admin SDK initialized successfully with default configuration.');
        }
    }
    catch (error) {
        console.error('[Bootstrap] Error initializing Firebase Admin SDK:', error);
        if (error instanceof Error) {
            console.error('[Bootstrap] Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
        }
        console.log('[Bootstrap] Continuing without Firebase Admin SDK - using default prompts.');
    }
    const logger = new logging_service_1.AppLoggerService();
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: logger,
        bufferLogs: true,
    });
    app.useLogger(logger);
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    const configService = app.get(config_1.ConfigService);
    app.enableCors({
        origin: configService.get('CORS_ORIGIN', '*'),
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors) => {
            const formattedErrors = errors.map((error) => {
                const constraints = error.constraints ? Object.values(error.constraints) : ['Invalid value'];
                return `${error.property}: ${constraints.join(', ')}`;
            });
            return {
                message: formattedErrors,
                statusCode: 400,
            };
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.GlobalExceptionFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.setGlobalPrefix('api');
    const port = configService.get('PORT', 3000);
    await app.listen(port);
    logger.log(`🚀 AI Beauty Lens Backend running on port ${port}`, 'Bootstrap');
}
bootstrap().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
});
