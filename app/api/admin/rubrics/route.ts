import { randomUUID } from "crypto";

import { getCurrentUser, isAdminEmail } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { getRubrics, saveRubrics } from "@/lib/store";
import type { RubricTemplate } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) {
    return fail("Unauthorized", 401);
  }

  const rubrics = await getRubrics();
  return ok({ rubrics });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) {
    return fail("Unauthorized", 401);
  }

  const body = (await request.json()) as Partial<RubricTemplate>;
  if (!body.subject || !body.markWeight || !body.expectedStructure) {
    return fail("Rubric subject, mark weight, and expected structure are required.");
  }

  const rubrics = await getRubrics();
  const now = new Date().toISOString();
  const rubric: RubricTemplate = {
    id: body.id || randomUUID(),
    subject: body.subject,
    questionType: "descriptive",
    markWeight: body.markWeight,
    expectedStructure: body.expectedStructure,
    keyPoints: body.keyPoints || [],
    presentationChecklist: body.presentationChecklist || [],
    sampleExpectations: body.sampleExpectations || [],
    createdAt: now,
    updatedAt: now
  };

  rubrics.push(rubric);
  await saveRubrics(rubrics);
  return ok({ rubric }, { status: 201 });
}
