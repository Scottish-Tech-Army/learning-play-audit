import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { SESClient } from "@aws-sdk/client-ses";

export const s3Client = new S3Client({ region: process.env.REGION });
export const dynamodbClient = new DynamoDBClient({
  region: process.env.REGION,
});
export const emailClient = new SESClient({ region: process.env.REGION });
