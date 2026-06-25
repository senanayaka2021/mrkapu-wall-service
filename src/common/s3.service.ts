import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PresignedUploadResult {
  uploadUrl: string;
  key: string;
  fileUrl: string;
  thumbUrl: string;
  expiresIn: number;
}

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly publicBaseUrl?: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET') || '';
    this.region = this.configService.get<string>('AWS_REGION') || 'ap-south-1';
    this.publicBaseUrl =
      this.configService.get<string>('AWS_S3_PUBLIC_URL') || undefined;

    this.client = new S3Client({
      region: this.region,
    });
  }

  private getBucket(): string {
    if (!this.bucket) {
      throw new Error('AWS_S3_BUCKET is not configured');
    }
    return this.bucket;
  }

  getPublicUrl(key: string): string {
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }
    return `https://${this.getBucket()}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /** Returns the key where the processed (compressed) version will be written by the media processor Lambda. */
  getProcessedKey(originalKey: string): string {
    const lastDot = originalKey.lastIndexOf('.');
    const base = lastDot !== -1 ? originalKey.slice(0, lastDot) : originalKey;
    return `${base}-processed.webp`;
  }

  /** Returns the key where the thumbnail will be written by the media processor Lambda. */
  getThumbKey(originalKey: string): string {
    const lastDot = originalKey.lastIndexOf('.');
    const base = lastDot !== -1 ? originalKey.slice(0, lastDot) : originalKey;
    return `${base}-thumb.webp`;
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.getBucket(), Key: key }),
    );
  }

  parseKeyFromUrl(url: string): string | null {
    try {
      return new URL(url).pathname.replace(/^\//, '') || null;
    } catch {
      return null;
    }
  }

  async createPresignedUpload(
    key: string,
    contentType: string,
    expiresInSeconds = 900,
  ): Promise<PresignedUploadResult> {
    const command = new PutObjectCommand({
      Bucket: this.getBucket(),
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: expiresInSeconds,
    });

    return {
      uploadUrl,
      key,
      fileUrl: this.getPublicUrl(key),
      thumbUrl: this.getPublicUrl(this.getThumbKey(key)),
      expiresIn: expiresInSeconds,
    };
  }
}
