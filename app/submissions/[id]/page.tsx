import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { SubmissionActions } from "@/components/submission-actions";
import { SubmissionEditor } from "@/components/submission-editor";
import { getCurrentUser } from "@/lib/auth";
import { getSubmissionById } from "@/lib/submissions";

export default async function SubmissionPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const submission = await getSubmissionById(id);
  if (!submission || submission.userId !== user.id) {
    notFound();
  }

  const result = submission.gradingResult;

  return (
    <div className="submissionPage">
      <div className="breadcrumbRow">
        <Link href="/dashboard">Back to dashboard</Link>
      </div>

      <section className="panel">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">{submission.subject}</p>
            <h1>{submission.markWeight}-mark answer review</h1>
          </div>
          <SubmissionActions submissionId={submission.id} />
        </div>

        <div className="detailGrid">
          <article className="detailCard">
            <h2>Question</h2>
            <p>{submission.questionText}</p>
            {submission.extractedQuestion ? <p className="helperText">{submission.extractedQuestion}</p> : null}
          </article>
          <article className="detailCard">
            <h2>Student Answer</h2>
            <p>{submission.answerText}</p>
            {submission.extractedAnswer ? <p className="helperText">{submission.extractedAnswer}</p> : null}
          </article>
        </div>
        <SubmissionEditor submission={submission} />
      </section>

      {result ? (
        <section className="resultPanel">
          <div className="resultSummary">
            <div className="scoreBubble large">
              <strong>
                {result.awardedMarks}/{result.maxMarks}
              </strong>
              <span>{result.overallVerdict}</span>
            </div>
            <div>
              <h2>Examiner summary</h2>
              <p>{result.justification}</p>
              <p className="helperText">
                Confidence {Math.round(result.confidence * 100)}% {result.needsManualReview ? "• Manual review suggested" : ""}
              </p>
            </div>
          </div>

          <div className="resultColumns">
            <article className="detailCard">
              <h3>What is good</h3>
              <ul>
                {result.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="detailCard">
              <h3>What is missing</h3>
              <ul>
                {result.missingPoints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="detailCard">
              <h3>How to improve</h3>
              <ul>
                {result.improvementSuggestions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>

          <div className="detailGrid">
            <article className="detailCard">
              <h3>Ideal approach</h3>
              <p>{result.idealAnswerApproach}</p>
            </article>
            <article className="detailCard">
              <h3>Sample rewrite</h3>
              <p>{result.rewrittenSampleAnswer}</p>
            </article>
          </div>
        </section>
      ) : (
        <section className="panel">
          <p className="helperText">
            This submission has not been graded yet. Use the actions above to run OCR placeholder text and then
            grade the answer.
          </p>
        </section>
      )}
    </div>
  );
}
