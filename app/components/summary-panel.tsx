"use client";

import { useMemo, useState } from "react";
import type { RepositoryAnalysis } from "../lib/github";

type SummaryMode = "overview" | "recruiter" | "setup" | "improvements";

type SummaryPanelProps = {
  analysis: RepositoryAnalysis;
  topics: string[];
};

const modeLabels: Record<SummaryMode, string> = {
  overview: "Overview",
  recruiter: "Recruiter",
  setup: "Setup",
  improvements: "Improve",
};

function buildSummaryText(
  analysis: RepositoryAnalysis,
  topics: string[],
  mode: SummaryMode,
) {
  if (mode === "recruiter") {
    return [
      `${analysis.repository.full_name} recruiter brief`,
      "",
      ...analysis.resumeBullets.map((bullet) => `- ${bullet}`),
      "",
      "Interview talking points:",
      ...analysis.talkingPoints.map((point) => `- ${point}`),
    ].join("\n");
  }

  if (mode === "setup") {
    return [
      `${analysis.repository.full_name} setup readout`,
      "",
      ...analysis.setupGuide.map((step, index) => `${index + 1}. ${step}`),
      "",
      analysis.scripts.length
        ? `Available scripts: ${analysis.scripts.join(", ")}`
        : "No package scripts were detected.",
      analysis.dependencies.length
        ? `Key dependencies: ${analysis.dependencies.slice(0, 8).join(", ")}`
        : "No package dependencies were detected.",
    ].join("\n");
  }

  if (mode === "improvements") {
    return [
      `${analysis.repository.full_name} improvement plan`,
      "",
      ...analysis.suggestions.map((suggestion) => `- ${suggestion}`),
      "",
      "Critical files to inspect:",
      ...analysis.importantFiles
        .slice(0, 5)
        .map((file) => `- ${file.path}: ${file.reason}`),
    ].join("\n");
  }

  return [
    analysis.summary,
    "",
    `README signal: ${analysis.readmeExcerpt}`,
    "",
    `Stack: ${analysis.techStack.join(", ") || "Not detected"}`,
    topics.length ? `Topics: ${topics.join(", ")}` : "",
    "",
    "Architecture:",
    ...analysis.architecture.map((item) => `- ${item}`),
  ]
    .filter(Boolean)
    .join("\n");
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export function SummaryPanel({ analysis, topics }: SummaryPanelProps) {
  const [mode, setMode] = useState<SummaryMode>("overview");
  const [activeAnalysis, setActiveAnalysis] = useState(analysis);
  const [status, setStatus] = useState("Ready");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const summaryText = useMemo(
    () => buildSummaryText(activeAnalysis, topics, mode),
    [activeAnalysis, mode, topics],
  );

  async function refreshSummary() {
    setIsRefreshing(true);
    setStatus("Refreshing from GitHub...");

    try {
      const owner = encodeURIComponent(activeAnalysis.repository.owner.login);
      const repo = encodeURIComponent(activeAnalysis.repository.name);
      const response = await fetch(
        `/api/analyze/${owner}/${repo}`,
      );

      if (!response.ok) {
        throw new Error(`Refresh failed with ${response.status}`);
      }

      const nextAnalysis = (await response.json()) as RepositoryAnalysis;
      setActiveAnalysis(nextAnalysis);
      setStatus("Summary refreshed");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function copySummary() {
    await copyText(summaryText);
    setStatus("Summary copied");
  }

  return (
    <article className="brutal-border bg-white p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em]">
            AI Summary
          </p>
          <h2 className="font-black-display text-3xl uppercase">
            Repo Readout
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={refreshSummary}
            disabled={isRefreshing}
            className="border-4 border-black bg-[#B9FF66] px-3 py-2 text-xs font-black uppercase tracking-[0.08em] shadow-[4px_4px_0_#000] disabled:opacity-60"
          >
            {isRefreshing ? "Refreshing" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={copySummary}
            className="border-4 border-black bg-[#FFD600] px-3 py-2 text-xs font-black uppercase tracking-[0.08em] shadow-[4px_4px_0_#000]"
          >
            Copy
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(Object.keys(modeLabels) as SummaryMode[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setMode(item);
              setStatus(`${modeLabels[item]} summary selected`);
            }}
            className={`border-4 border-black px-3 py-2 text-xs font-black uppercase tracking-[0.08em] ${
              mode === item ? "bg-[#FF4D8D]" : "bg-[#F1F1F1]"
            }`}
          >
            {modeLabels[item]}
          </button>
        ))}
      </div>

      <pre className="mt-5 max-h-[420px] overflow-auto whitespace-pre-wrap border-4 border-black bg-[#F1F1F1] p-4 font-sans text-base font-bold leading-7">
        {summaryText}
      </pre>
      <p className="mt-3 text-sm font-black uppercase tracking-[0.08em]">
        {status}
      </p>
    </article>
  );
}
