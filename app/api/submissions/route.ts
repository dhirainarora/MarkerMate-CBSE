import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { createSubmission, listUserSubmissions, saveSubmissionAsset } from "@/lib/submissions";
import type { Subject } from "@/lib/types";

const allowedSubjects: Subject[] = ["English", "Science", "Social Science"];

export async function GET() {
  try {
    const user = await requireUser();
    const submissions = await listUserSubmissions(user.id);
    return ok({ submissions });
  } catch {
    return fail("Unauthorized", 401);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const subject = String(formData.get("subject") || "") as Subject;
      const questionText = String(formData.get("questionText") || "");
      const answerText = String(formData.get("answerText") || "");
      const markWeight = Number(formData.get("markWeight") || 0);
      const topic = String(formData.get("topic") || "");

      if (!allowedSubjects.includes(subject)) {
        return fail("Choose a valid subject.");
      }

      if (!questionText.trim() || !answerText.trim()) {
        return fail("Question and answer text are required.");
      }

      if (![1, 2, 3, 5].includes(markWeight)) {
        return fail("Mark weight must be 1, 2, 3, or 5.");
      }

      const submission = await createSubmission(user, {
        subject,
        questionText,
        answerText,
        markWeight,
        topic
      });

      const questionImage = formData.get("questionImage");
      const answerImage = formData.get("answerImage");

      if (questionImage instanceof File && questionImage.size > 0) {
        await saveSubmissionAsset(
          submission.id,
          "questionImage",
          questionImage.name,
          questionImage.type,
          new Uint8Array(await questionImage.arrayBuffer())
        );
      }

      if (answerImage instanceof File && answerImage.size > 0) {
        await saveSubmissionAsset(
          submission.id,
          "answerImage",
          answerImage.name,
          answerImage.type,
          new Uint8Array(await answerImage.arrayBuffer())
        );
      }

      return ok({ submission }, { status: 201 });
    }

    const body = await request.json();
    const subject = String(body.subject || "") as Subject;
    const questionText = String(body.questionText || "");
    const answerText = String(body.answerText || "");
    const markWeight = Number(body.markWeight || 0);
    const topic = String(body.topic || "");

    if (!allowedSubjects.includes(subject)) {
      return fail("Choose a valid subject.");
    }

    if (!questionText.trim() || !answerText.trim()) {
      return fail("Question and answer text are required.");
    }

    if (![1, 2, 3, 5].includes(markWeight)) {
      return fail("Mark weight must be 1, 2, 3, or 5.");
    }

    const submission = await createSubmission(user, {
      subject,
      questionText,
      answerText,
      markWeight,
      topic
    });

    return ok({ submission }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return fail("Unauthorized", 401);
    }

    return fail("Unable to create submission.", 500);
  }
}
