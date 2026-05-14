import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExportActions } from "../../components/export-actions";
import { SummaryPanel } from "../../components/summary-panel";
import {
  fetchRepositoryAnalysis,
  GitHubRequestError,
  repoTopics,
  type RepositoryAnalysis,
  type TreeNode,
} from "../../lib/github";

type RepoPageProps = {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
};

export async function generateMetadata({ params }: RepoPageProps) {
  const { owner, repo } = await params;

  return {
    title: `${owner}/${repo} | GitGlimpse`,
    description: `Architecture, stack, complexity, and resume insights for ${owner}/${repo}.`,
  };
}

function numberFormatter(value: number) {
  return new Intl.NumberFormat("en", {
    notation: value > 9999 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className={`brutal-border-sm ${color} p-4`}>
      <p className="text-xs font-black uppercase tracking-[0.12em]">{label}</p>
      <p className="mt-2 font-display text-3xl font-black">{value}</p>
    </div>
  );
}

function TagList({ items }: { items: string[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="border-4 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.08em]"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function FileTree({ nodes }: { nodes: TreeNode[] }) {
  return (
    <ul className="space-y-2 text-sm font-bold">
      {nodes.map((node) => (
        <li key={node.path} className="border-4 border-black bg-white p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate font-black">
              {node.type === "folder" ? "./" : ""}
              {node.name}
            </span>
            <span className="shrink-0 bg-black px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-white">
              {node.type}
            </span>
          </div>
          {node.children.length ? (
            <ul className="mt-3 space-y-2 border-l-4 border-black pl-3">
              {node.children.slice(0, 7).map((child) => (
                <li key={child.path} className="truncate">
                  {child.type === "folder" ? "./" : ""}
                  {child.name}
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function ErrorState({ owner, repo, message }: { owner: string; repo: string; message: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#FFD600] px-4">
      <section className="brutal-border max-w-2xl bg-white p-8">
        <p className="text-sm font-black uppercase tracking-[0.12em]">
          GitHub fetch failed
        </p>
        <h1 className="mt-3 font-black-display text-4xl uppercase">
          {owner}/{repo}
        </h1>
        <p className="mt-4 text-lg font-bold leading-8">{message}</p>
        <Link
          href="/"
          className="mt-6 inline-flex border-4 border-black bg-[#FF4D8D] px-5 py-3 text-sm font-black uppercase tracking-[0.08em] shadow-[5px_5px_0_#000]"
        >
          Back Home
        </Link>
      </section>
    </main>
  );
}

function RepoDashboard({ analysis }: { analysis: RepositoryAnalysis }) {
  const { repository } = analysis;
  const topics = repoTopics(repository);
  const openGraphImage = `https://opengraph.githubassets.com/gitglimpse/${repository.full_name}`;

  return (
    <main className="min-h-screen bg-[#F1F1F1] text-black">
      <header className="sticky top-0 z-30 border-b-4 border-black bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-black-display text-xl uppercase sm:text-2xl">
            GitGlimpse
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={repository.html_url}
              className="border-4 border-black bg-[#FFD600] px-4 py-2 text-sm font-black uppercase tracking-[0.08em] shadow-[4px_4px_0_#000]"
            >
              GitHub
            </a>
            <span className="border-4 border-black bg-[#B9FF66] px-4 py-2 text-sm font-black uppercase tracking-[0.08em] shadow-[4px_4px_0_#000]">
              Score {analysis.complexityScore}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <aside className="h-fit border-4 border-black bg-white p-4 shadow-[6px_6px_0_#000] lg:sticky lg:top-24">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.12em]">
            Repo Map
          </p>
          <nav className="grid gap-2 text-sm font-black uppercase tracking-[0.08em]">
            {[
              "Overview",
              "Stack",
              "Summary",
              "Files",
              "Resume",
              "Contributors",
              "Export",
            ].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="border-4 border-black bg-[#F1F1F1] px-3 py-2 hover:bg-[#FFD600]"
                >
                  {item}
                </a>
              ))}
          </nav>
        </aside>

        <div className="min-w-0 space-y-6">
          <section id="overview" className="brutal-border overflow-hidden bg-white">
            <div className="relative min-h-64 border-b-4 border-black bg-[#3B82F6]">
              <Image
                src={openGraphImage}
                alt={`${repository.full_name} GitHub preview`}
                fill
                sizes="(min-width: 1024px) 960px, 100vw"
                className="object-cover opacity-25"
                priority
              />
              <div className="relative z-10 flex min-h-64 flex-col justify-between p-5 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <Image
                      src={repository.owner.avatar_url}
                      alt={`${repository.owner.login} avatar`}
                      width={76}
                      height={76}
                      className="border-4 border-black bg-white"
                    />
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.12em] text-white">
                        gitglimpse.com/{repository.full_name}
                      </p>
                      <h1 className="mt-2 break-words font-black-display text-4xl uppercase leading-none text-white sm:text-6xl">
                        {repository.full_name}
                      </h1>
                    </div>
                  </div>
                  <div className="border-4 border-black bg-[#FFD600] px-4 py-3 text-center shadow-[6px_6px_0_#000]">
                    <p className="text-xs font-black uppercase tracking-[0.12em]">
                      Complexity
                    </p>
                    <p className="font-display text-4xl font-black">
                      {analysis.complexityScore}
                    </p>
                    <p className="text-xs font-black uppercase">
                      {analysis.complexityLabel}
                    </p>
                  </div>
                </div>
                <p className="mt-8 max-w-4xl border-4 border-black bg-white p-4 text-lg font-bold leading-8">
                  {analysis.summary}
                </p>
              </div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatBox
                label="Stars"
                value={numberFormatter(repository.stargazers_count)}
                color="bg-[#FFD600]"
              />
              <StatBox
                label="Forks"
                value={numberFormatter(repository.forks_count)}
                color="bg-[#B9FF66]"
              />
              <StatBox
                label="Issues"
                value={numberFormatter(repository.open_issues_count)}
                color="bg-[#FF4D8D]"
              />
              <StatBox
                label="Updated"
                value={formatDate(repository.pushed_at)}
                color="bg-[#F1F1F1]"
              />
            </div>
            {analysis.warnings?.length ? (
              <div className="border-t-4 border-black bg-[#FFD600] p-4 text-sm font-black uppercase tracking-[0.08em]">
                Limited mode: {analysis.warnings.join(" ")}
              </div>
            ) : null}
          </section>

          <section id="stack" className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <article className="brutal-border bg-white p-5">
              <h2 className="font-black-display text-3xl uppercase">Language Mix</h2>
              <div className="mt-5 space-y-4">
                {analysis.languages.length ? (
                  analysis.languages.slice(0, 6).map((language) => (
                    <div key={language.name}>
                      <div className="mb-2 flex justify-between text-sm font-black uppercase">
                        <span>{language.name}</span>
                        <span>{language.percentage}%</span>
                      </div>
                      <div className="h-6 border-4 border-black bg-[#F1F1F1]">
                        <div
                          className="h-full border-r-4 border-black"
                          style={{
                            width: `${Math.max(language.percentage, 4)}%`,
                            backgroundColor: language.color,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="font-bold">GitHub did not report language stats.</p>
                )}
              </div>
            </article>
            <article className="brutal-border bg-[#FFD600] p-5">
              <h2 className="font-black-display text-3xl uppercase">Tech Stack</h2>
              <div className="mt-5">
                <TagList items={analysis.techStack} />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="border-4 border-black bg-white p-4">
                  <p className="text-sm font-black uppercase tracking-[0.1em]">
                    Scripts
                  </p>
                  <p className="mt-2 font-display text-3xl font-black">
                    {analysis.scripts.length || 0}
                  </p>
                </div>
                <div className="border-4 border-black bg-white p-4">
                  <p className="text-sm font-black uppercase tracking-[0.1em]">
                    Dependencies
                  </p>
                  <p className="mt-2 font-display text-3xl font-black">
                    {analysis.dependencies.length + analysis.devDependencies.length}
                  </p>
                </div>
              </div>
            </article>
          </section>

          <section id="summary" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <SummaryPanel analysis={analysis} topics={topics} />
            <div className="grid gap-6">
              <article className="border-4 border-black bg-[#B9FF66] p-4">
                <h3 className="font-display text-2xl font-black uppercase">
                  Architecture
                </h3>
                <ul className="mt-4 space-y-3 text-base font-bold leading-7">
                  {analysis.architecture.map((item) => (
                    <li key={item} className="border-l-4 border-black pl-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
              <article className="border-4 border-black bg-white p-4">
                <h3 className="font-display text-2xl font-black uppercase">
                  Topics
                </h3>
                <div className="mt-4">
                  <TagList items={topics} />
                </div>
              </article>
            </div>
          </section>

          <section id="files" className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="brutal-border bg-[#FF4D8D] p-5">
              <h2 className="font-black-display text-3xl uppercase">File Tree</h2>
              <div className="mt-5">
                <FileTree nodes={analysis.fileTree} />
              </div>
              {analysis.treeTruncated ? (
                <p className="mt-4 border-4 border-black bg-white p-3 text-sm font-black uppercase">
                  GitHub returned a truncated tree.
                </p>
              ) : null}
            </article>
            <article className="brutal-border bg-white p-5">
              <h2 className="font-black-display text-3xl uppercase">Module Insights</h2>
              <div className="mt-5 grid gap-3">
                {analysis.folderBreakdown.map((folder) => (
                  <div
                    key={folder.name}
                    className="border-4 border-black bg-[#F1F1F1] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-display text-xl font-black">
                        ./{folder.name}
                      </h3>
                      <span className="border-4 border-black bg-[#FFD600] px-2 py-1 text-xs font-black">
                        {folder.files} files
                      </span>
                    </div>
                    <p className="mt-2 font-bold leading-7">{folder.explanation}</p>
                  </div>
                ))}
              </div>
              <h3 className="mt-6 font-display text-2xl font-black uppercase">
                Critical Files
              </h3>
              <div className="mt-3 grid gap-3">
                {analysis.importantFiles.map((file) => (
                  <div key={file.path} className="border-4 border-black bg-[#B9FF66] p-3">
                    <p className="break-words font-black">{file.path}</p>
                    <p className="mt-1 font-bold leading-6">{file.reason}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section id="resume" className="brutal-border bg-black p-5 text-white">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
              <article>
                <h2 className="font-black-display text-3xl uppercase">
                  Resume-Worthy Takeaways
                </h2>
                <ul className="mt-5 space-y-3 text-base font-bold leading-7">
                  {analysis.resumeBullets.map((bullet) => (
                    <li key={bullet} className="border-4 border-white p-3">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
              <article className="border-4 border-white bg-[#FFD600] p-4 text-black">
                <h3 className="font-display text-2xl font-black uppercase">
                  Setup Guide
                </h3>
                <ol className="mt-4 space-y-3 font-bold leading-7">
                  {analysis.setupGuide.map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center border-4 border-black bg-white font-black">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </article>
            </div>
          </section>

          <section id="contributors" className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <article className="brutal-border bg-white p-5">
              <h2 className="font-black-display text-3xl uppercase">
                Contributor Intelligence
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {analysis.contributors.map((contributor) => (
                  <a
                    key={contributor.id}
                    href={contributor.html_url}
                    className="flex items-center gap-3 border-4 border-black bg-[#F1F1F1] p-3 transition hover:-translate-y-1 hover:bg-[#FFD600]"
                  >
                    <Image
                      src={contributor.avatar_url}
                      alt={`${contributor.login} avatar`}
                      width={52}
                      height={52}
                      className="border-4 border-black bg-white"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-black">{contributor.login}</p>
                      <p className="text-sm font-bold">
                        {contributor.contributions} commits
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </article>
            <article id="export" className="brutal-border bg-[#3B82F6] p-5">
              <h2 className="font-black-display text-3xl uppercase text-white">
                Export
              </h2>
              <ExportActions analysis={analysis} />
            </article>
          </section>
        </div>
      </div>
    </main>
  );
}

export default async function RepoPage({ params }: RepoPageProps) {
  const { owner, repo } = await params;
  let analysis: RepositoryAnalysis;

  try {
    analysis = await fetchRepositoryAnalysis(owner, repo);
  } catch (error) {
    if (error instanceof GitHubRequestError && error.status === 404) {
      notFound();
    }

    return (
      <ErrorState
        owner={owner}
        repo={repo}
        message={
          error instanceof Error
            ? error.message
            : "GitHub could not return this repository right now."
        }
      />
    );
  }

  return <RepoDashboard analysis={analysis} />;
}
