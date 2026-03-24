import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="homePage">
      <section className="heroCard">
        <div>
          <p className="eyebrow">Class 10 CBSE Answer Checker</p>
          <h1>Check handwritten or typed answers against board-style mark weightage.</h1>
          <p className="heroText">
            MarkerMate helps students understand how an examiner reads their answer. Submit the question,
            submit the answer, set the marks, and get scoring plus better ways to write for full marks.
          </p>
          <div className="ctaRow">
            <Link className="primaryButton" href={user ? "/dashboard" : "/signup"}>
              {user ? "Open Dashboard" : "Create Student Account"}
            </Link>
            <Link className="ghostButton" href="#how-it-works">
              See Workflow
            </Link>
          </div>
        </div>
        <div className="heroPanel">
          <div className="scoreBubble">
            <strong>3.5 / 5</strong>
            <span>Partially correct</span>
          </div>
          <ul>
            <li>Missing one textbook point</li>
            <li>Good start, but answer is too short for 5 marks</li>
            <li>Add a conclusion to strengthen presentation</li>
          </ul>
        </div>
      </section>

      <section className="infoGrid" id="how-it-works">
        <article className="infoCard">
          <h2>1. Submit question + answer</h2>
          <p>Type both fields directly or upload answer photos and keep the text editable for OCR correction.</p>
        </article>
        <article className="infoCard">
          <h2>2. Select mark weightage</h2>
          <p>The grading logic changes for 1, 2, 3, and 5-mark questions so students learn length and depth.</p>
        </article>
        <article className="infoCard">
          <h2>3. Get examiner-style feedback</h2>
          <p>See awarded marks, missing points, ideal structure, and a rewritten sample answer for full marks.</p>
        </article>
      </section>

      <section className="subjectBand" id="subjects">
        <div>
          <p className="eyebrow">V1 Subject Coverage</p>
          <h2>English, Science, and Social Science</h2>
        </div>
        <p>
          The app is tuned for descriptive board answers and NCERT-style presentation. Objective questions,
          numericals, and diagrams are intentionally out of scope for the first version.
        </p>
      </section>
    </div>
  );
}
