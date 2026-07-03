import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

let s3Client: S3Client | null = null;

function getS3() {
  if (!s3Client) {
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error("AWS credentials or region not fully configured in environment variables.");
    }
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
    bucket: process.env.AWS_BUCKET_NAME || "",
    region: process.env.AWS_REGION || "ap-south-1"
  };
}

export async function uploadToS3(
  buffer: Buffer,
  fileName: string
): Promise<{ key: string; url: string }> {
  const { client, bucket, region } = getS3();
  if (!bucket) {
    throw new Error("AWS_BUCKET_NAME environment variable is not set.");
  }
  const key = `resumes/${Date.now()}-${fileName}`;

  await client.send(
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
  const { client, bucket } = getS3();
  if (!bucket) {
    throw new Error("AWS_BUCKET_NAME environment variable is not set.");
  }
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}
