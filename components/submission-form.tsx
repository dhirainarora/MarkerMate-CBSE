"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const subjects = ["English", "Science", "Social Science"];
const markWeights = [1, 2, 3, 5];

export function SubmissionForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="submissionForm"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        startTransition(async () => {
          setError("");
          const formData = new FormData(event.currentTarget);
          const response = await fetch("/api/submissions", {
            method: "POST",
            body: formData
          });

          const data = await response.json();
          if (!response.ok) {
            setError(data.error || "Unable to create submission.");
            return;
          }

          const submissionId = data.submission?.id;
          if (!submissionId) {
            setError("Submission created but ID was missing.");
            return;
          }

          router.push(`/submissions/${submissionId}`);
          router.refresh();
        });
      }}
    >
      <div className="gridTwo">
        <label>
          Subject
          <select defaultValue="English" name="subject" required>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </label>
        <label>
          Mark Weightage
          <select defaultValue="3" name="markWeight" required>
            {markWeights.map((weight) => (
              <option key={weight} value={weight}>
                {weight} mark{weight > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Topic or chapter
        <input name="topic" placeholder="Optional: Nationalism in India" />
      </label>

      <label>
        Question
        <textarea
          name="questionText"
          placeholder="Type the exact board-style question here."
          required
          rows={4}
        />
      </label>

      <label>
        Student Answer
        <textarea
          name="answerText"
          placeholder="Type the student's answer exactly as written."
          required
          rows={9}
        />
      </label>

      <div className="gridTwo">
        <label>
          Upload question photo
          <input accept="image/*" name="questionImage" type="file" />
        </label>
        <label>
          Upload answer photo
          <input accept="image/*" name="answerImage" type="file" />
        </label>
      </div>

      <p className="helperText">
        The app saves typed text immediately and stores uploaded images for OCR review.
      </p>
      {error ? <p className="errorText">{error}</p> : null}
      <button className="primaryButton" disabled={isPending} type="submit">
        {isPending ? "Submitting..." : "Create Submission"}
      </button>
    </form>
  );
}
