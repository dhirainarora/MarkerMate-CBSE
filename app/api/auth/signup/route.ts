import { createSession, findUserByEmail, hashPassword } from "@/lib/auth";
import { fail, ok, isValidEmail } from "@/lib/http";
import { createUserRecord, getUsers, saveUsers } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (name.length < 2) {
    return fail("Name must be at least 2 characters.");
  }

  if (!isValidEmail(email)) {
    return fail("Enter a valid email address.");
  }

  if (password.length < 6) {
    return fail("Password must be at least 6 characters.");
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return fail("An account already exists for this email.", 409);
  }

  const users = await getUsers();
  const user = createUserRecord({
    name,
    email,
    passwordHash: hashPassword(password)
  });

  users.push(user);
  await saveUsers(users);
  await createSession(user.id);

  return ok({
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
}
