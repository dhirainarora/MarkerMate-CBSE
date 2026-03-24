import { requireUser } from "@/lib/auth";
import { gradeSubmission } from "@/lib/grading";
import { fail, ok } from "@/lib/http";
import { getSubmissionById, updateSubmission } from "@/lib/submissions";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const submission = await getSubmissionById(id);

    if (!submission || submission.userId !== user.id) {
      return fail("Submission not found.", 404);
    }

    const gradingResult = await gradeSubmission(submission);
    const updated = await updateSubmission(id, (current) => ({
      ...current,
      status: "graded",
      gradingResult
    }));

    return ok({ submission: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return fail("Unauthorized", 401);
    }

    return fail("Unable to grade submission.", 500);
  }
}
