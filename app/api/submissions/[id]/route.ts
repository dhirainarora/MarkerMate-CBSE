import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { getSubmissionById, updateSubmission } from "@/lib/submissions";
import type { Subject } from "@/lib/types";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const submission = await getSubmissionById(id);

    if (!submission || submission.userId !== user.id) {
      return fail("Submission not found.", 404);
    }

    return ok({ submission });
  } catch {
    return fail("Unauthorized", 401);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const submission = await getSubmissionById(id);

    if (!submission || submission.userId !== user.id) {
      return fail("Submission not found.", 404);
    }

    const body = await request.json();
    const patch = {
      subject: body.subject as Subject | undefined,
      questionText: typeof body.questionText === "string" ? body.questionText.trim() : undefined,
      answerText: typeof body.answerText === "string" ? body.answerText.trim() : undefined,
      extractedQuestion:
        typeof body.extractedQuestion === "string" ? body.extractedQuestion.trim() : undefined,
      extractedAnswer: typeof body.extractedAnswer === "string" ? body.extractedAnswer.trim() : undefined,
      markWeight: typeof body.markWeight === "number" ? body.markWeight : undefined,
      topic: typeof body.topic === "string" ? body.topic.trim() : undefined
    };

    const updated = await updateSubmission(id, (current) => ({
      ...current,
      subject: patch.subject || current.subject,
      questionText: patch.questionText ?? current.questionText,
      answerText: patch.answerText ?? current.answerText,
      extractedQuestion: patch.extractedQuestion ?? current.extractedQuestion,
      extractedAnswer: patch.extractedAnswer ?? current.extractedAnswer,
      markWeight: patch.markWeight ?? current.markWeight,
      topic: patch.topic ?? current.topic
    }));

    return ok({ submission: updated });
  } catch {
    return fail("Unauthorized", 401);
  }
}
