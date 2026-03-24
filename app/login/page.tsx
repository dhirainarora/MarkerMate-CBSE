import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <section className="authPage">
      <div className="authCard">
        <p className="eyebrow">Student Login</p>
        <h1>Continue your answer checking practice.</h1>
        <AuthForm mode="login" />
        <p className="helperText">
          Need an account? <Link href="/signup">Create one here</Link>.
        </p>
      </div>
    </section>
  );
}
