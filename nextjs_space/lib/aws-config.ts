
import { S3Client } from '@aws-sdk/client-s3';

export function getBucketConfig() {
  return {
    bucketName: process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME || '',
    folderPrefix: process.env.AWS_S3_FOLDER_PREFIX || process.env.AWS_FOLDER_PREFIX || ''
  };
}

export function createS3Client() {
  const region = process.env.AWS_S3_REGION || process.env.AWS_REGION || 'us-east-2';
  
  // Se as credenciais explícitas estiverem disponíveis, use-as (ignora AWS_PROFILE)
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  
  // Caso contrário, use as credenciais padrão (AWS_PROFILE, etc)
  return new S3Client({
    region,
  });
}
