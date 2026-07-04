import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

let s3Client: S3Client | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${name}`
    );
  }

  return value;
}

function getS3() {
  if (!s3Client) {
    const region = getRequiredEnv("S3_REGION");
    const accessKeyId = getRequiredEnv("S3_ACCESS_KEY_ID");
    const secretAccessKey = getRequiredEnv("S3_SECRET_ACCESS_KEY");

    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  return {
    client: s3Client,
    bucket: getRequiredEnv("S3_BUCKET_NAME"),
    region: getRequiredEnv("S3_REGION"),
  };
}

export async function uploadToS3(
  buffer: Buffer,
  fileName: string
): Promise<{ key: string; url: string }> {
  const { client, bucket, region } = getS3();

  const key = `resumes/${Date.now()}-${fileName}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: "application/pdf",
    })
  );

  return {
    key,
    url: `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
  };
}

export async function deleteFromS3(key: string): Promise<void> {
  const { client, bucket } = getS3();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}