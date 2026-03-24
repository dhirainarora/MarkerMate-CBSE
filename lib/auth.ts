import { createHash, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import { createSessionRecord, getSessions, getUsers, saveSessions } from "@/lib/store";
import type { SessionRecord, UserRecord } from "@/lib/types";

const SESSION_COOKIE = "cbse_session";

export function hashPassword(password: string) {
  const salt = randomUUID();
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, existing] = storedHash.split(":");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(existing, "hex"), Buffer.from(derived, "hex"));
}

export async function findUserByEmail(email: string) {
  const users = await getUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function createSession(userId: string) {
  const sessions = await getSessions();
  const session = createSessionRecord(userId);
  sessions.push(session);
  await saveSessions(sessions);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return session;
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return;
  }

  const sessions = await getSessions();
  await saveSessions(sessions.filter((session) => session.id !== token));
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentSession(): Promise<SessionRecord | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const sessions = await getSessions();
  return sessions.find((session) => session.id === token) ?? null;
}

export async function getCurrentUser(): Promise<UserRecord | null> {
  const session = await getCurrentSession();
  if (!session) {
    return null;
  }

  const users = await getUsers();
  return users.find((user) => user.id === session.userId) ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export function gravatarSeed(email: string) {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

export function isAdminEmail(email: string) {
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes(email.trim().toLowerCase());
}
