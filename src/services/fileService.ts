import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../shared/utils/s3";
import { saveFile, findFileById } from "../repositories/fileRepo";
import { v4 as uuid } from "uuid";

const BUCKET = process.env.S3_BUCKET!;

function generateKey(userId: number, mimeType: string) {
  const ext = mimeType.split("/")[1];
  return `uploads/${userId}/${uuid()}.${ext}`;
}

export async function createUploadPresignedUrl(
  userId: number,
  mimeType: string
) {
  const key = generateKey(userId, mimeType);

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 300,
  });

  await saveFile({
    s3Key: key,
    mimeType,
    user: { id: userId } as any,
  });

  return { uploadUrl, key };
}

export async function createViewPresignedUrl(
  fileId: number,
  userId: number
) {
  const file = await findFileById(fileId);

  if (!file || file.user.id !== userId) {
    throw new Error("File not found or unauthorized");
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: file.s3Key,
  });

  const viewUrl = await getSignedUrl(s3, command, {
    expiresIn: 300,
  });

  return { viewUrl };
}

export async function uploadFileViaBackend(
  userId: number,
  buffer: Buffer,
  mimeType: string
) {
  const key = generateKey(userId, mimeType);

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });

  await s3.send(command);

  await saveFile({
    s3Key: key,
    mimeType,
    user: { id: userId } as any,
  });

  return { key };
}

