import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <section className="authPage">
      <div className="authCard">
        <p className="eyebrow">Create Student Account</p>
        <h1>Start checking board answers with mark-wise feedback.</h1>
        <AuthForm mode="signup" />
        <p className="helperText">
          Already have an account? <Link href="/login">Log in</Link>.
        </p>
      </div>
    </section>
  );
}
