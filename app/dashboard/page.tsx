import { redirect } from "next/navigation";

import { HistoryList } from "@/components/history-list";
import { SubmissionForm } from "@/components/submission-form";
import { getCurrentUser } from "@/lib/auth";
import { listUserSubmissions } from "@/lib/submissions";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const submissions = await listUserSubmissions(user.id);

  return (
    <div className="dashboardPage">
      <section className="panel">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">New Submission</p>
            <h1>Check a board-style answer</h1>
          </div>
          <p className="helperText">Typed text is required even when images are uploaded so OCR can be corrected.</p>
        </div>
        <SubmissionForm />
      </section>

      <section className="panel">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">History</p>
            <h2>Saved submissions</h2>
          </div>
        </div>
        {submissions.length === 0 ? (
          <p className="helperText">No submissions yet. Create one above to start checking answers.</p>
        ) : (
          <HistoryList submissions={submissions} />
        )}
      </section>
    </div>
  );
}
