import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { LambdaClient } from "@aws-sdk/client-lambda";

export const s3Client = new S3Client(process.env.REGION);
export const dynamodbClient = new DynamoDBClient({ region: process.env.REGION });
export const lambdaClient = new LambdaClient({ region: process.env.REGION });
