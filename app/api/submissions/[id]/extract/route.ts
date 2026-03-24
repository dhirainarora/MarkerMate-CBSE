import { requireUser } from "@/lib/auth";
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

    const questionAsset = submission.assets.find((asset) => asset.kind === "questionImage");
    const answerAsset = submission.assets.find((asset) => asset.kind === "answerImage");

    const updated = await updateSubmission(id, (current) => ({
      ...current,
      extractedQuestion:
        current.extractedQuestion ||
        (questionAsset
          ? "OCR placeholder: external OCR provider not configured yet. Edit the question text manually if extraction is incorrect."
          : current.questionText),
      extractedAnswer:
        current.extractedAnswer ||
        (answerAsset
          ? "OCR placeholder: external OCR provider not configured yet. Edit the answer text manually if extraction is incorrect."
          : current.answerText)
    }));

    return ok({ submission: updated });
  } catch {
    return fail("Unauthorized", 401);
  }
}
