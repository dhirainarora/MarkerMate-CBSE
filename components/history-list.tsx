"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { SubmissionRecord } from "@/lib/types";

type HistoryListProps = {
  submissions: SubmissionRecord[];
};

export function HistoryList({ submissions }: HistoryListProps) {
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  const filtered = useMemo(() => {
    return submissions.filter((submission) => {
      const subjectMatch = subjectFilter === "All" || submission.subject === subjectFilter;
      const date = new Date(submission.createdAt);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      const dateMatch =
        dateFilter === "All" ||
        (dateFilter === "Last 7 days" && diffDays <= 7) ||
        (dateFilter === "Last 30 days" && diffDays <= 30);

      return subjectMatch && dateMatch;
    });
  }, [dateFilter, subjectFilter, submissions]);

  return (
    <div className="historyWrapper">
      <div className="gridTwo">
        <label>
          Filter by subject
          <select onChange={(event) => setSubjectFilter(event.target.value)} value={subjectFilter}>
            <option value="All">All</option>
            <option value="English">English</option>
            <option value="Science">Science</option>
            <option value="Social Science">Social Science</option>
          </select>
        </label>
        <label>
          Filter by date
          <select onChange={(event) => setDateFilter(event.target.value)} value={dateFilter}>
            <option value="All">All time</option>
            <option value="Last 7 days">Last 7 days</option>
            <option value="Last 30 days">Last 30 days</option>
          </select>
        </label>
      </div>

      <div className="historyList">
        {filtered.length === 0 ? (
          <p className="helperText">No submissions match the current filters.</p>
        ) : (
          filtered.map((submission) => (
            <Link className="historyCard" href={`/submissions/${submission.id}`} key={submission.id}>
              <div>
                <strong>{submission.subject}</strong>
                <p>{submission.questionText.slice(0, 90)}...</p>
              </div>
              <div className="historyMeta">
                <span>{submission.markWeight} marks</span>
                <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
                {submission.gradingResult ? (
                  <strong>
                    {submission.gradingResult.awardedMarks}/{submission.gradingResult.maxMarks}
                  </strong>
                ) : (
                  <strong>Awaiting grade</strong>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
