"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type SubmissionActionsProps = {
  submissionId: string;
};

export function SubmissionActions({ submissionId }: SubmissionActionsProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function runAction(path: string, successText: string) {
    startTransition(async () => {
      setMessage("");
      const response = await fetch(path, { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Action failed.");
        return;
      }

      setMessage(successText);
      router.refresh();
    });
  }

  return (
    <div className="actionRow">
      <button
        className="ghostButton"
        disabled={isPending}
        onClick={() => runAction(`/api/submissions/${submissionId}/extract`, "OCR text refreshed.")}
        type="button"
      >
        Run OCR Placeholder
      </button>
      <button
        className="primaryButton"
        disabled={isPending}
        onClick={() => runAction(`/api/submissions/${submissionId}/grade`, "Answer graded successfully.")}
        type="button"
      >
        Grade Answer
      </button>
      {message ? <p className="helperText">{message}</p> : null}
    </div>
  );
}
