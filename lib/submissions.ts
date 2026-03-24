import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { getSubmissions, saveSubmissions } from "@/lib/store";
import type { SubmissionAsset, SubmissionPayload, SubmissionRecord, UserRecord } from "@/lib/types";

export async function listUserSubmissions(userId: string) {
  const submissions = await getSubmissions();
  return submissions
    .filter((item) => item.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getSubmissionById(id: string) {
  const submissions = await getSubmissions();
  return submissions.find((item) => item.id === id) ?? null;
}

export async function createSubmission(user: UserRecord, payload: SubmissionPayload) {
  const submissions = await getSubmissions();
  const now = new Date().toISOString();

  const record: SubmissionRecord = {
    id: randomUUID(),
    userId: user.id,
    subject: payload.subject,
    questionText: payload.questionText.trim(),
    answerText: payload.answerText.trim(),
    markWeight: payload.markWeight,
    topic: payload.topic?.trim() || undefined,
    status: "ready",
    assets: [],
    createdAt: now,
    updatedAt: now
  };

  submissions.push(record);
  await saveSubmissions(submissions);
  return record;
}

export async function updateSubmission(id: string, updater: (submission: SubmissionRecord) => SubmissionRecord) {
  const submissions = await getSubmissions();
  const index = submissions.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }

  submissions[index] = {
    ...updater(submissions[index]),
    updatedAt: new Date().toISOString()
  };
  await saveSubmissions(submissions);
  return submissions[index];
}

export async function saveSubmissionAsset(
  submissionId: string,
  kind: SubmissionAsset["kind"],
  fileName: string,
  mimeType: string,
  bytes: Uint8Array
) {
  const uploadsDir = path.join(process.cwd(), "storage", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const safeName = `${randomUUID()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const filePath = path.join(uploadsDir, safeName);
  await writeFile(filePath, bytes);

  return updateSubmission(submissionId, (submission) => ({
    ...submission,
    assets: [
      ...submission.assets,
      {
        id: randomUUID(),
        kind,
        fileName,
        mimeType,
        filePath,
        createdAt: new Date().toISOString()
      }
    ]
  }));
}
