import { DetectModerationLabelsCommand, RekognitionClient } from '@aws-sdk/client-rekognition';
import { fromIni } from '@aws-sdk/credential-providers';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const ADULT_TOP_LABELS = new Set([
  'Explicit Nudity',
  'Nudity',
  'Suggestive',
  'Sexual Activity',
]);

@Injectable()
export class RekognitionService {
  private readonly client: RekognitionClient;
  private readonly bucket: string;
  private readonly logger = new Logger(RekognitionService.name);

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION') || 'ap-southeast-1';
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET') || '';
    // In Lambda the IAM execution role provides credentials automatically.
    // Locally (no AWS_LAMBDA_FUNCTION_NAME) use the owlester profile.
    const credentials = process.env.AWS_LAMBDA_FUNCTION_NAME
      ? undefined
      : fromIni({ profile: 'owlester' });
    this.client = new RekognitionClient({ region, ...(credentials ? { credentials } : {}) });
  }

  async isAdultContent(s3Key: string, minConfidence = 75): Promise<boolean> {
    try {
      const { ModerationLabels = [] } = await this.client.send(
        new DetectModerationLabelsCommand({
          Image: { S3Object: { Bucket: this.bucket, Name: s3Key } },
          MinConfidence: minConfidence,
        }),
      );
      for (const label of ModerationLabels) {
        if (
          ADULT_TOP_LABELS.has(label.Name ?? '') ||
          ADULT_TOP_LABELS.has(label.ParentName ?? '')
        ) {
          this.logger.warn(
            `[rekognition] blocked key=${s3Key} label=${label.Name} parent=${label.ParentName} confidence=${label.Confidence}`,
          );
          return true;
        }
      }
      return false;
    } catch (err: any) {
      // Fail open — don't block posts if Rekognition is temporarily unavailable
      this.logger.error(`[rekognition] scan failed key=${s3Key} err=${err?.message}`);
      return false;
    }
  }
}
