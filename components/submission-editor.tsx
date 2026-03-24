"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { SubmissionRecord } from "@/lib/types";

type SubmissionEditorProps = {
  submission: SubmissionRecord;
};

export function SubmissionEditor({ submission }: SubmissionEditorProps) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="submissionForm"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
          setStatus("");
          const response = await fetch(`/api/submissions/${submission.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              questionText: String(formData.get("questionText") || ""),
              answerText: String(formData.get("answerText") || ""),
              extractedQuestion: String(formData.get("extractedQuestion") || ""),
              extractedAnswer: String(formData.get("extractedAnswer") || "")
            })
          });

          const data = await response.json();
          setStatus(response.ok ? "Text updated." : data.error || "Unable to update submission.");
          router.refresh();
        });
      }}
    >
      <div className="detailGrid">
        <label>
          Question text
          <textarea defaultValue={submission.questionText} name="questionText" rows={5} />
        </label>
        <label>
          OCR question text
          <textarea defaultValue={submission.extractedQuestion} name="extractedQuestion" rows={5} />
        </label>
      </div>
      <div className="detailGrid">
        <label>
          Answer text
          <textarea defaultValue={submission.answerText} name="answerText" rows={10} />
        </label>
        <label>
          OCR answer text
          <textarea defaultValue={submission.extractedAnswer} name="extractedAnswer" rows={10} />
        </label>
      </div>
      <div className="actionRow">
        <button className="ghostButton" disabled={isPending} type="submit">
          {isPending ? "Saving..." : "Save Edited Text"}
        </button>
        {status ? <p className="helperText">{status}</p> : null}
      </div>
    </form>
  );
}
