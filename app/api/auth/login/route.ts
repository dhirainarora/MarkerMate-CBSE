import { createSession, findUserByEmail, verifyPassword } from "@/lib/auth";
import { fail, ok, isValidEmail } from "@/lib/http";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!isValidEmail(email) || !password) {
    return fail("Enter your email and password.");
  }

  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return fail("Invalid email or password.", 401);
  }

  await createSession(user.id);

  return ok({
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
}
