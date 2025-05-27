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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppLoggerService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util = __importStar(require("util"));
let AppLoggerService = class AppLoggerService {
    constructor() {
        this.logLevels = ['error', 'warn', 'log', 'debug', 'verbose'];
        const currentEnv = process.env.NODE_ENV || 'development';
        const logLevel = process.env.LOG_LEVEL || (currentEnv === 'production' ? 'warn' : 'debug');
        const levelIndex = this.logLevels.indexOf(logLevel);
        if (levelIndex >= 0) {
            this.logLevels = this.logLevels.slice(0, levelIndex + 1);
        }
        this.logDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
        this.errorLogStream = fs.createWriteStream(path.join(this.logDir, 'error.log'), { flags: 'a' });
        this.combinedLogStream = fs.createWriteStream(path.join(this.logDir, 'combined.log'), { flags: 'a' });
        this.log(`Application started in ${currentEnv} environment with log level: ${logLevel}`);
    }
    formatMessage(level, message, context) {
        const timestamp = new Date().toISOString();
        const formattedMessage = typeof message === 'object'
            ? util.inspect(message, { depth: 5 })
            : message;
        return `[${timestamp}] [${level.toUpperCase()}] ${context ? `[${context}] ` : ''}${formattedMessage}`;
    }
    writeToLogs(level, message) {
        const logLine = `${message}\n`;
        this.combinedLogStream.write(logLine);
        if (level === 'error' || level === 'warn') {
            this.errorLogStream.write(logLine);
        }
        if (level === 'error') {
            console.error(message);
        }
        else if (level === 'warn') {
            console.warn(message);
        }
        else {
            console.log(message);
        }
    }
    log(message, context) {
        if (this.logLevels.includes('log')) {
            const formattedMessage = this.formatMessage('info', message, context);
            this.writeToLogs('info', formattedMessage);
        }
    }
    error(message, trace, context) {
        if (this.logLevels.includes('error')) {
            let formattedMessage = this.formatMessage('error', message, context);
            if (trace) {
                formattedMessage += `\n${trace}`;
            }
            this.writeToLogs('error', formattedMessage);
        }
    }
    warn(message, context) {
        if (this.logLevels.includes('warn')) {
            const formattedMessage = this.formatMessage('warn', message, context);
            this.writeToLogs('warn', formattedMessage);
        }
    }
    debug(message, context) {
        if (this.logLevels.includes('debug')) {
            const formattedMessage = this.formatMessage('debug', message, context);
            this.writeToLogs('debug', formattedMessage);
        }
    }
    verbose(message, context) {
        if (this.logLevels.includes('verbose')) {
            const formattedMessage = this.formatMessage('verbose', message, context);
            this.writeToLogs('verbose', formattedMessage);
        }
    }
};
exports.AppLoggerService = AppLoggerService;
exports.AppLoggerService = AppLoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AppLoggerService);
