"use client";

import { useState } from "react";
import type { RepositoryAnalysis } from "../lib/github";

type ExportActionsProps = {
  analysis: RepositoryAnalysis;
};

function safeFileName(value: string) {
  return value.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-|-$/g, "");
}

function downloadTextFile(fileName: string, contents: string, mimeType: string) {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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

function toMarkdown(analysis: RepositoryAnalysis) {
  const repo = analysis.repository;

  return [
    `# GitGlimpse Report: ${repo.full_name}`,
    "",
    `GitHub: ${repo.html_url}`,
    `Generated: ${new Date(analysis.generatedAt).toLocaleString()}`,
    `Complexity: ${analysis.complexityScore} (${analysis.complexityLabel})`,
    "",
    "## Summary",
    "",
    analysis.summary,
    "",
    "## README Signal",
    "",
    analysis.readmeExcerpt,
    "",
    "## Tech Stack",
    "",
    analysis.techStack.length
      ? analysis.techStack.map((item) => `- ${item}`).join("\n")
      : "- No stack signals detected.",
    "",
    "## Architecture",
    "",
    analysis.architecture.map((item) => `- ${item}`).join("\n"),
    "",
    "## Module Insights",
    "",
    analysis.folderBreakdown
      .map((folder) => `- ${folder.name}: ${folder.explanation}`)
      .join("\n"),
    "",
    "## Critical Files",
    "",
    analysis.importantFiles
      .map((file) => `- ${file.path}: ${file.reason}`)
      .join("\n"),
    "",
    "## Resume Bullets",
    "",
    analysis.resumeBullets.map((bullet) => `- ${bullet}`).join("\n"),
    "",
    "## Setup Guide",
    "",
    analysis.setupGuide.map((step, index) => `${index + 1}. ${step}`).join("\n"),
    "",
    "## Improvement Suggestions",
    "",
    analysis.suggestions.map((suggestion) => `- ${suggestion}`).join("\n"),
    "",
  ].join("\n");
}

export function ExportActions({ analysis }: ExportActionsProps) {
  const [status, setStatus] = useState("Choose an export");
  const fileBase = safeFileName(`gitglimpse-${analysis.repository.full_name}`);

  function exportPdf() {
    setStatus("Opening print dialog");
    window.print();
  }

  function exportMarkdown() {
    downloadTextFile(`${fileBase}.md`, toMarkdown(analysis), "text/markdown");
    setStatus("Markdown downloaded");
  }

  function exportJson() {
    downloadTextFile(
      `${fileBase}.json`,
      JSON.stringify(analysis, null, 2),
      "application/json",
    );
    setStatus("JSON downloaded");
  }

  async function copyPublicLink() {
    await copyText(window.location.href);
    setStatus("Public link copied");
  }

  return (
    <div className="mt-5 grid gap-3">
      <button
        type="button"
        onClick={exportPdf}
        className="border-4 border-black bg-white px-4 py-3 text-left font-black uppercase tracking-[0.08em] shadow-[4px_4px_0_#000] transition hover:-translate-y-1"
      >
        PDF Report
      </button>
      <button
        type="button"
        onClick={exportMarkdown}
        className="border-4 border-black bg-white px-4 py-3 text-left font-black uppercase tracking-[0.08em] shadow-[4px_4px_0_#000] transition hover:-translate-y-1"
      >
        Markdown Brief
      </button>
      <button
        type="button"
        onClick={copyPublicLink}
        className="border-4 border-black bg-white px-4 py-3 text-left font-black uppercase tracking-[0.08em] shadow-[4px_4px_0_#000] transition hover:-translate-y-1"
      >
        Public Link
      </button>
      <button
        type="button"
        onClick={exportJson}
        className="border-4 border-black bg-[#B9FF66] px-4 py-3 text-left font-black uppercase tracking-[0.08em] shadow-[4px_4px_0_#000] transition hover:-translate-y-1"
      >
        JSON Data
      </button>
      <p className="border-4 border-black bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.08em]">
        {status}
      </p>
    </div>
  );
}
