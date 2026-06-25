import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { S3Event } from 'aws-lambda';
import * as sharp from 'sharp';

const s3 = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' });
const BUCKET = process.env.AWS_S3_BUCKET || '';

const PROCESSED_MAX_WIDTH = 1080;
const PROCESSED_QUALITY = 80;
const THUMB_WIDTH = 400;
const THUMB_HEIGHT = 400;
const THUMB_QUALITY = 70;

function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function derivedKey(originalKey: string, suffix: string): string {
  const lastDot = originalKey.lastIndexOf('.');
  const base = lastDot !== -1 ? originalKey.slice(0, lastDot) : originalKey;
  return `${base}${suffix}`;
}

function isProcessedOrThumb(key: string): boolean {
  return key.endsWith('-processed.webp') || key.endsWith('-thumb.webp');
}

async function processImage(key: string): Promise<void> {
  const getRes = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const inputBuffer = await streamToBuffer(getRes.Body as NodeJS.ReadableStream);

  const originalSize = inputBuffer.length;
  const meta = await sharp(inputBuffer).metadata();
  console.log(`[media-processor] IMAGE original  key=${key} size=${kb(originalSize)} dimensions=${meta.width}x${meta.height} format=${meta.format}`);

  const processedKey = derivedKey(key, '-processed.webp');
  const thumbKey = derivedKey(key, '-thumb.webp');

  const [processedBuffer, thumbBuffer] = await Promise.all([
    sharp(inputBuffer)
      .resize({ width: PROCESSED_MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: PROCESSED_QUALITY })
      .toBuffer(),
    sharp(inputBuffer)
      .resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: 'cover', position: 'centre' })
      .webp({ quality: THUMB_QUALITY })
      .toBuffer(),
  ]);

  console.log(`[media-processor] IMAGE processed key=${processedKey} size=${kb(processedBuffer.length)} saved=${kb(originalSize - processedBuffer.length)} (${Math.round((1 - processedBuffer.length / originalSize) * 100)}%)`);
  console.log(`[media-processor] IMAGE thumb     key=${thumbKey} size=${kb(thumbBuffer.length)}`);

  await Promise.all([
    s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: processedKey,
      Body: processedBuffer,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000',
    })),
    s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: thumbKey,
      Body: thumbBuffer,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000',
    })),
  ]);

  // Keep the original so imageUrls stored in posts always resolve.
  // Use an S3 lifecycle rule to expire originals after 7 days once processed/* exists.
  console.log(`[media-processor] IMAGE done      key=${key} processed+thumb saved (original kept)`);
}

export const handler = async (event: S3Event): Promise<void> => {
  for (const record of event.Records) {
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    const s3Size = record.s3.object.size;

    if (isProcessedOrThumb(key)) continue;

    const isImage = /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(key);

    console.log(`[media-processor] RECEIVED key=${key} size=${kb(s3Size)} type=${isImage ? 'image' : 'skipped'}`);

    if (!isImage) continue;

    try {
      await processImage(key);
    } catch (err) {
      console.error(`[media-processor] ERROR key=${key}`, err);
    }
  }
};
