import { redirect } from "next/navigation";

import { getCurrentUser, isAdminEmail } from "@/lib/auth";
import { getRubrics } from "@/lib/store";

export default async function AdminRubricsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  const rubrics = await getRubrics();

  return (
    <section className="panel">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Rubric Library</h1>
        </div>
        <p className="helperText">Access is controlled by the `ADMIN_EMAILS` environment variable.</p>
      </div>

      <div className="historyList">
        {rubrics.map((rubric) => (
          <article className="detailCard" key={rubric.id}>
            <strong>
              {rubric.subject} • {rubric.markWeight} marks
            </strong>
            <p>{rubric.expectedStructure}</p>
            <p className="helperText">Key points: {rubric.keyPoints.join(", ")}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
