import { getRubrics } from "@/lib/store";
import type { RubricTemplate, Subject } from "@/lib/types";

export async function findRubric(subject: Subject, markWeight: number): Promise<RubricTemplate> {
  const rubrics = await getRubrics();
  const rubric =
    rubrics.find((item) => item.subject === subject && item.markWeight === markWeight) ??
    rubrics.find((item) => item.subject === subject && item.markWeight === 3);

  if (!rubric) {
    throw new Error(`Rubric not found for ${subject} ${markWeight}-mark question`);
  }

  return rubric;
}
