"use client";

import { FormEvent, useState } from "react";

function resolveRepoPath(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  const sshMatch = trimmed.match(/^git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/i);

  if (sshMatch) {
    return `/${sshMatch[1]}/${sshMatch[2].replace(/\.git$/i, "")}`;
  }

  const withProtocol = /^[a-z]+:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    const host = url.hostname.replace(/^www\./i, "");

    if (host === "github.com" || host === "gitglimpse.com") {
      const [owner, repo] = url.pathname
        .split("/")
        .filter(Boolean)
        .map((part) => decodeURIComponent(part));

      if (owner && repo) {
        return `/${owner}/${repo.replace(/\.git$/i, "")}`;
      }
    }
  } catch {
    const [owner, repo] = trimmed.split("/").filter(Boolean);

    if (owner && repo) {
      return `/${owner}/${repo.replace(/\.git$/i, "")}`;
    }
  }

  return null;
}

export function RepoUrlForm() {
  const [value, setValue] = useState("github.com/vercel/next.js");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const destination = resolveRepoPath(value);

    if (!destination) {
      setError("Paste a GitHub repo URL like github.com/vercel/next.js");
      return;
    }

    window.location.assign(destination);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="brutal-border grid w-full max-w-3xl gap-3 bg-white p-3 sm:grid-cols-[1fr_auto]"
    >
      <label className="sr-only" htmlFor="repo-url">
        GitHub repository URL
      </label>
      <input
        id="repo-url"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setError("");
        }}
        className="min-h-14 w-full border-4 border-black bg-[#F1F1F1] px-4 text-base font-black text-black outline-none transition focus:bg-white sm:text-lg"
        placeholder="github.com/owner/repo"
      />
      <button
        type="submit"
        className="min-h-14 border-4 border-black bg-[#FF4D8D] px-6 text-sm font-black uppercase tracking-[0.08em] text-black shadow-[5px_5px_0_#000] transition hover:-translate-y-1 hover:shadow-[8px_8px_0_#000] active:translate-y-0 active:shadow-[3px_3px_0_#000] sm:text-base"
      >
        Glimpse Repo
      </button>
      {error ? (
        <p className="text-sm font-bold text-[#c30042] sm:col-span-2">{error}</p>
      ) : null}
    </form>
  );
}
