"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const formData = new FormData(event.currentTarget);

    const body = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || "")
    };

    const response = await fetch(`/api/auth/${mode === "login" ? "login" : "signup"}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Something went wrong.");
      setPending(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form
      className="stackForm"
      onSubmit={handleSubmit}
    >
      {mode === "signup" ? (
        <label>
          Full Name
          <input name="name" placeholder="Riya Sharma" required />
        </label>
      ) : null}
      <label>
        Email
        <input name="email" placeholder="student@example.com" required type="email" />
      </label>
      <label>
        Password
        <input name="password" placeholder="At least 6 characters" required type="password" />
      </label>
      {error ? <p className="errorText">{error}</p> : null}
      <button className="primaryButton" disabled={pending} type="submit">
        {pending ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
      </button>
    </form>
  );
}
