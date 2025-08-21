import { Storage } from '@google-cloud/storage';
import envConfig from '../config/env.config';
import path from 'path';

class GCSService {
  private storage: Storage;
  private bucketName: string;

  constructor() {
    this.bucketName = envConfig.GCS_BUCKET_NAME;

    this.storage = new Storage({
      projectId: envConfig.GCS_PROJECT_ID,
      keyFilename: './elm-ai-469623-08f39025610f.json',
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucketName);

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = path.extname(file.originalname);
      const fileName = `${folder}/${timestamp}_${randomString}${fileExtension}`;

      const fileUpload = bucket.file(fileName);

      await fileUpload.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname,
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
      return publicUrl;

    } catch (error) {
      console.error(error)
      throw new Error('Failed to upload file to Google Cloud Storage');
    }
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const fileName = fileUrl.split(`https://storage.googleapis.com/${this.bucketName}/`)[1];

      if (!fileName) {
        throw new Error('Invalid file URL');
      }

      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(fileName);

      await file.delete();
      return true;

    } catch (error) {
      return false;
    }
  }

  async getSignedUrl(fileName: string, expiresIn: number = 3600000): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(fileName);

      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresIn,
      });

      return signedUrl;

    } catch (error) {
      throw new Error('Failed to generate signed URL');
    }
  }

  async fileExists(fileName: string): Promise<boolean> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(fileName);
      const [exists] = await file.exists();
      return exists;

    } catch (error) {
      return false;
    }
  }
}

export default new GCSService();
