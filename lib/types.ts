export type Subject = "English" | "Science" | "Social Science";

export type QuestionType = "descriptive";

export type RubricTemplate = {
  id: string;
  subject: Subject;
  questionType: QuestionType;
  markWeight: number;
  expectedStructure: string;
  keyPoints: string[];
  presentationChecklist: string[];
  sampleExpectations: string[];
  createdAt: string;
  updatedAt: string;
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type SessionRecord = {
  id: string;
  userId: string;
  createdAt: string;
};

export type SubmissionAsset = {
  id: string;
  kind: "questionImage" | "answerImage";
  fileName: string;
  mimeType: string;
  filePath: string;
  createdAt: string;
};

export type GradingResult = {
  id: string;
  awardedMarks: number;
  maxMarks: number;
  overallVerdict: string;
  strengths: string[];
  missingPoints: string[];
  improvementSuggestions: string[];
  idealAnswerApproach: string;
  rewrittenSampleAnswer: string;
  confidence: number;
  needsManualReview: boolean;
  justification: string;
  createdAt: string;
};

export type SubmissionRecord = {
  id: string;
  userId: string;
  subject: Subject;
  questionText: string;
  answerText: string;
  markWeight: number;
  topic?: string;
  status: "draft" | "ready" | "graded";
  assets: SubmissionAsset[];
  extractedQuestion?: string;
  extractedAnswer?: string;
  gradingResult?: GradingResult;
  createdAt: string;
  updatedAt: string;
};

export type SubmissionPayload = {
  subject: Subject;
  questionText: string;
  answerText: string;
  markWeight: number;
  topic?: string;
};
