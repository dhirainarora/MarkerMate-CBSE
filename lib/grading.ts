import { randomUUID } from "crypto";

import { findRubric } from "@/lib/rubrics";
import type { GradingResult, SubmissionRecord } from "@/lib/types";

function splitSentences(value: string) {
  return value
    .split(/[.!?\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeWords(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

function uniqueOverlap(a: string[], b: string[]) {
  const source = new Set(a);
  return [...new Set(b)].filter((item) => source.has(item));
}

function buildIdealAnswer(question: string, answer: string, markWeight: number, subject: string) {
  const sentences = splitSentences(answer).slice(0, Math.max(markWeight, 2));
  const intro = `For this ${markWeight}-mark ${subject} answer, begin with a direct response to "${question.trim()}".`;
  const body =
    sentences.length > 0
      ? `Then organize the explanation as ${sentences.map((item) => `"${item}"`).join(", ")}.`
      : "Then add point-wise explanation with accurate textbook vocabulary.";
  const close = markWeight >= 5 ? "Finish with a concluding line or application." : "End without extra filler.";
  return `${intro} ${body} ${close}`;
}

function buildRewrittenSample(question: string, answer: string, markWeight: number, subject: string) {
  const sentences = splitSentences(answer);
  const chosen = sentences.slice(0, Math.max(markWeight, 2));
  const prefix = `Answering the ${markWeight}-mark ${subject} question "${question.trim()}":`;
  if (chosen.length === 0) {
    return `${prefix} Start with the core idea, add ${markWeight} clear textbook-style points, and keep the explanation directly tied to the question.`;
  }

  return `${prefix} ${chosen.map((item, index) => `${index + 1}. ${item}`).join(" ")} ${
    markWeight >= 5 ? "Conclude with one final summarizing line." : ""
  }`.trim();
}

export async function gradeSubmission(submission: SubmissionRecord): Promise<GradingResult> {
  const rubric = await findRubric(submission.subject, submission.markWeight);
  const questionWords = normalizeWords(submission.questionText);
  const answerWords = normalizeWords(submission.answerText);
  const overlap = uniqueOverlap(questionWords, answerWords);
  const sentenceCount = splitSentences(submission.answerText).length;
  const expectedSentences = submission.markWeight === 1 ? 1 : submission.markWeight === 2 ? 2 : submission.markWeight === 3 ? 3 : 5;
  const coverageRatio = questionWords.length === 0 ? 0.5 : overlap.length / Math.max(questionWords.length, 1);
  const lengthRatio = Math.min(sentenceCount / expectedSentences, 1);
  const rawScore = (coverageRatio * 0.6 + lengthRatio * 0.4) * submission.markWeight;
  const awardedMarks = Math.max(0, Math.min(submission.markWeight, Number(rawScore.toFixed(1))));

  const missingPoints = rubric.keyPoints
    .filter((point) => !answerWords.some((word) => point.toLowerCase().includes(word)))
    .slice(0, 4);

  const improvementSuggestions = [
    `Match the ${submission.markWeight}-mark weightage by writing at least ${expectedSentences} clear idea${expectedSentences > 1 ? "s" : ""}.`,
    `Use textbook-style words related to ${submission.subject}.`,
    `Keep every sentence focused on the exact demand of the question.`,
    `Add specific points from the rubric such as ${rubric.keyPoints.slice(0, 2).join(" and ")}.`
  ].filter((item, index, arr) => arr.indexOf(item) === index);

  const strengths = [
    coverageRatio > 0.35 ? "Your answer addresses the question directly." : "You have started with a relevant point.",
    sentenceCount >= Math.max(1, expectedSentences - 1)
      ? "The answer has usable structure for the mark range."
      : "You have the core idea, but the answer needs more development.",
    awardedMarks >= submission.markWeight - 1
      ? "The content is already close to full-mark quality."
      : "There is enough base content to improve with a few focused additions."
  ];

  const justification =
    awardedMarks >= submission.markWeight - 0.5
      ? "The response is relevant and mostly complete for the required weightage, but a few refinements can make it examiner-ready."
      : awardedMarks >= submission.markWeight / 2
        ? "The answer has some correct content, but it does not fully meet the expected depth and structure for this mark range."
        : "The answer is incomplete or too general for the asked question and mark weightage.";

  return {
    id: randomUUID(),
    awardedMarks,
    maxMarks: submission.markWeight,
    overallVerdict:
      awardedMarks >= submission.markWeight - 0.5
        ? "Strong answer"
        : awardedMarks >= submission.markWeight / 2
          ? "Partially correct"
          : "Needs major improvement",
    strengths,
    missingPoints:
      missingPoints.length > 0
        ? missingPoints
        : ["The answer is good. Add sharper textbook vocabulary and a cleaner structure for even stronger presentation."],
    improvementSuggestions,
    idealAnswerApproach: buildIdealAnswer(
      submission.questionText,
      submission.answerText,
      submission.markWeight,
      submission.subject
    ),
    rewrittenSampleAnswer: buildRewrittenSample(
      submission.questionText,
      submission.answerText,
      submission.markWeight,
      submission.subject
    ),
    confidence: Number((0.45 + Math.min(coverageRatio + lengthRatio, 1) * 0.45).toFixed(2)),
    needsManualReview: coverageRatio < 0.18,
    justification,
    createdAt: new Date().toISOString()
  };
}
