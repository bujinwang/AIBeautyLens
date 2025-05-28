import { Request, Response } from 'express';
import { Storage } from '@google-cloud/storage';
import { PubSub } from '@google-cloud/pubsub';
import * as Busboy from 'busboy';
// @ts-ignore
import sharp from 'sharp';
import path from 'path';
import os from 'os';
import fs from 'fs';

/**
 * HTTP Cloud Function for processing images
 * Handles image upload, validation, and preprocessing
 */
export const processImage = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Processing image request:', req.method);
    
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    
    const busboy = new (Busboy as any)({ headers: req.headers });
    let uploadError: Error | null = null;
    let fileUploaded = false;
    let publicUrl = '';
    let gcsFileName = '';
    let fileType = '';
    let fileSize = 0;
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
    const storage = new Storage();
    const bucket = storage.bucket(process.env.IMAGE_BUCKET!);
    const pubsub = new PubSub();
    const topicName = process.env.ANALYSIS_TOPIC!;

    busboy.on('file', (fieldname: string, file: NodeJS.ReadableStream, filename: string, encoding: string, mimetype: string) => {
      fileType = mimetype;
      if (!ALLOWED_TYPES.includes(mimetype)) {
        uploadError = new Error('Invalid file type');
        file.resume();
        return;
      }
      gcsFileName = `${Date.now()}_${filename}`;
      const tempFilePath = path.join(os.tmpdir(), gcsFileName);
      const outStream = fs.createWriteStream(tempFilePath);
      let size = 0;
      file.on('data', (data: Buffer) => {
        size += data.length;
        if (size > MAX_SIZE) {
          uploadError = new Error('File too large');
          file.resume();
        }
      });
      file.pipe(outStream);
      outStream.on('finish', async () => {
        if (uploadError) {
          fs.unlinkSync(tempFilePath);
          return;
        }
        // Optional: Resize/optimize with sharp
        const processedPath = tempFilePath + '_processed';
        await sharp(tempFilePath)
          .resize({ width: 1024, withoutEnlargement: true })
          .toFile(processedPath);
        // Upload to GCS
        await bucket.upload(processedPath, {
          destination: gcsFileName,
          contentType: mimetype,
        });
        publicUrl = `gs://${bucket.name}/${gcsFileName}`;
        fileUploaded = true;
        fs.unlinkSync(tempFilePath);
        fs.unlinkSync(processedPath);
        // Trigger Pub/Sub for analysis
        const message = { imageUrl: publicUrl, fileName: gcsFileName, fileType };
        await pubsub.topic(topicName).publishMessage({ data: Buffer.from(JSON.stringify(message)) });
      });
    });
    busboy.on('finish', () => {
      if (uploadError) {
        res.status(400).json({ error: uploadError.message });
      } else if (!fileUploaded) {
        res.status(400).json({ error: 'No file uploaded' });
      } else {
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
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};