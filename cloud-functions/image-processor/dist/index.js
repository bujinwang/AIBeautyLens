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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processImage = void 0;
const storage_1 = require("@google-cloud/storage");
const pubsub_1 = require("@google-cloud/pubsub");
const Busboy = __importStar(require("busboy"));
// @ts-ignore
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
/**
 * HTTP Cloud Function for processing images
 * Handles image upload, validation, and preprocessing
 */
const processImage = async (req, res) => {
    try {
        console.log('Processing image request:', req.method);
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }
        const busboy = new Busboy({ headers: req.headers });
        let uploadError = null;
        let fileUploaded = false;
        let publicUrl = '';
        let gcsFileName = '';
        let fileType = '';
        let fileSize = 0;
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
        const storage = new storage_1.Storage();
        const bucket = storage.bucket(process.env.IMAGE_BUCKET);
        const pubsub = new pubsub_1.PubSub();
        const topicName = process.env.ANALYSIS_TOPIC;
        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            fileType = mimetype;
            if (!ALLOWED_TYPES.includes(mimetype)) {
                uploadError = new Error('Invalid file type');
                file.resume();
                return;
            }
            gcsFileName = `${Date.now()}_${filename}`;
            const tempFilePath = path_1.default.join(os_1.default.tmpdir(), gcsFileName);
            const outStream = fs_1.default.createWriteStream(tempFilePath);
            let size = 0;
            file.on('data', (data) => {
                size += data.length;
                if (size > MAX_SIZE) {
                    uploadError = new Error('File too large');
                    file.resume();
                }
            });
            file.pipe(outStream);
            outStream.on('finish', async () => {
                if (uploadError) {
                    fs_1.default.unlinkSync(tempFilePath);
                    return;
                }
                // Optional: Resize/optimize with sharp
                const processedPath = tempFilePath + '_processed';
                await (0, sharp_1.default)(tempFilePath)
                    .resize({ width: 1024, withoutEnlargement: true })
                    .toFile(processedPath);
                // Upload to GCS
                await bucket.upload(processedPath, {
                    destination: gcsFileName,
                    contentType: mimetype,
                });
                publicUrl = `gs://${bucket.name}/${gcsFileName}`;
                fileUploaded = true;
                fs_1.default.unlinkSync(tempFilePath);
                fs_1.default.unlinkSync(processedPath);
                // Trigger Pub/Sub for analysis
                const message = { imageUrl: publicUrl, fileName: gcsFileName, fileType };
                await pubsub.topic(topicName).publishMessage({ data: Buffer.from(JSON.stringify(message)) });
            });
        });
        busboy.on('finish', () => {
            if (uploadError) {
                res.status(400).json({ error: uploadError.message });
            }
            else if (!fileUploaded) {
                res.status(400).json({ error: 'No file uploaded' });
            }
            else {
                res.status(200).json({
                    success: true,
                    message: 'Image processing completed',
                    imageUrl: publicUrl,
                    fileName: gcsFileName,
                    timestamp: new Date().toISOString(),
                });
            }
        });
        req.pipe(busboy);
    }
    catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.processImage = processImage;
//# sourceMappingURL=index.js.map