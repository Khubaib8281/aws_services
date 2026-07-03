import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION!;
const bucket = process.env.AWS_BUCKET_NAME;
if (!bucket) {
  throw new Error("AWS_BUCKET_NAME environment variable is not set. Ensure it is defined in Amplify console environment variables.");
}

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(
  buffer: Buffer,
  fileName: string
): Promise<{ key: string; url: string }> {
  const key = `resumes/${Date.now()}-${fileName}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: "application/pdf",
    })
  );

  const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  return { key, url };
}

export async function deleteFromS3(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}
