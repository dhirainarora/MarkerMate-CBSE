import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import rubricSeed from "@/data/rubrics.seed.json";
import type {
  RubricTemplate,
  SessionRecord,
  SubmissionRecord,
  UserRecord
} from "@/lib/types";

const storageDir = path.join(process.cwd(), "storage");

async function ensureStorage() {
  await mkdir(storageDir, { recursive: true });
}

async function readCollection<T>(fileName: string, fallback: T[]): Promise<T[]> {
  await ensureStorage();
  const filePath = path.join(storageDir, fileName);

  try {
    const data = await readFile(filePath, "utf8");
    return JSON.parse(data) as T[];
  } catch {
    await writeCollection(fileName, fallback);
    return fallback;
  }
}

async function writeCollection<T>(fileName: string, data: T[]) {
  await ensureStorage();
  const filePath = path.join(storageDir, fileName);
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function stamp<T extends Record<string, unknown>>(record: T): T {
  const now = new Date().toISOString();
  return {
    ...record,
    createdAt: now,
    updatedAt: now
  };
}

export async function getUsers() {
  return readCollection<UserRecord>("users.json", []);
}

export async function saveUsers(users: UserRecord[]) {
  await writeCollection("users.json", users);
}

export async function getSessions() {
  return readCollection<SessionRecord>("sessions.json", []);
}

export async function saveSessions(sessions: SessionRecord[]) {
  await writeCollection("sessions.json", sessions);
}

export async function getSubmissions() {
  return readCollection<SubmissionRecord>("submissions.json", []);
}

export async function saveSubmissions(submissions: SubmissionRecord[]) {
  await writeCollection("submissions.json", submissions);
}

export async function getRubrics() {
  const seeded = rubricSeed.map((rubric) => ({
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...rubric
  })) as RubricTemplate[];

  const stored = await readCollection<RubricTemplate>("rubrics.json", []);
  if (stored.length > 0) {
    return stored;
  }

  await writeCollection("rubrics.json", seeded);
  return seeded;
}

export async function saveRubrics(rubrics: RubricTemplate[]) {
  await writeCollection("rubrics.json", rubrics);
}

export function createUserRecord(data: Omit<UserRecord, "id" | "createdAt">): UserRecord {
  return {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...data
  };
}

export function createSessionRecord(userId: string): SessionRecord {
  return {
    id: randomUUID(),
    userId,
    createdAt: new Date().toISOString()
  };
}

export function createSubmissionRecord(
  submission: Omit<SubmissionRecord, "id" | "createdAt" | "updatedAt">
): SubmissionRecord {
  return stamp({
    id: randomUUID(),
    ...submission
  }) as SubmissionRecord;
}
