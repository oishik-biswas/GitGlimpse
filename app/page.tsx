import Image from "next/image";
import Link from "next/link";
import { RepoUrlForm } from "./components/repo-url-form";

const featureTiles = [
  {
    title: "AI Summary",
    copy: "Repository purpose, key workflows, and signal without tab-hopping.",
    color: "bg-[#FFD600]",
  },
  {
    title: "File Tree",
    copy: "Critical folders, config files, and module roles in one scan.",
    color: "bg-[#B9FF66]",
  },
  {
    title: "Resume",
    copy: "Recruiter-ready bullets and interview talking points from real code.",
    color: "bg-[#FF4D8D]",
  },
  {
    title: "Export",
    copy: "Markdown, PDF, and public reports for sharing a clean technical readout.",
    color: "bg-[#3B82F6]",
  },
];

const popularRepos = [
  {
    owner: "vercel",
    repo: "next.js",
    image: "https://github.com/vercel.png",
    accent: "bg-[#000000] text-white",
  },
  {
    owner: "facebook",
    repo: "react",
    image: "https://github.com/facebook.png",
    accent: "bg-[#3B82F6] text-black",
  },
  {
    owner: "openai",
    repo: "openai-cookbook",
    image: "https://github.com/openai.png",
    accent: "bg-[#B9FF66] text-black",
  },
];

const pipelineSteps = ["Swap URL", "Fetch GitHub", "Parse Source", "Generate Insights"];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F1F1F1] text-black">
      <header className="sticky top-0 z-30 border-b-4 border-black bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="font-black-display text-xl uppercase tracking-[0.02em] sm:text-2xl"
          >
            GitGlimpse
          </Link>
          <div className="hidden items-center gap-6 text-sm font-black uppercase tracking-[0.08em] md:flex">
            <a href="#features" className="hover:text-[#FF4D8D]">
              Features
            </a>
            <a href="#showcase" className="hover:text-[#3B82F6]">
              Repos
            </a>
            <a href="#dashboard" className="hover:text-[#B9FF66]">
              Dashboard
            </a>
          </div>
          <Link
            href="/vercel/next.js"
            className="border-4 border-black bg-[#FFD600] px-4 py-2 text-sm font-black uppercase tracking-[0.08em] shadow-[4px_4px_0_#000] transition hover:-translate-y-1 hover:shadow-[7px_7px_0_#000]"
          >
            Try Demo
          </Link>
        </nav>
      </header>

      <section className="grid-paper relative min-h-[82vh] border-b-4 border-black bg-[#FFD600] px-4 py-10 sm:px-6 lg:px-8">
        <div className="absolute right-[-120px] top-20 hidden w-[620px] rotate-2 border-4 border-black bg-white shadow-[12px_12px_0_#000] lg:block">
          <div className="flex items-center justify-between border-b-4 border-black bg-[#3B82F6] px-5 py-3">
            <span className="font-black uppercase tracking-[0.08em]">
              gitglimpse.com/vercel/next.js
            </span>
            <span className="border-4 border-black bg-[#B9FF66] px-3 py-1 font-black">
              94
            </span>
          </div>
          <div className="grid grid-cols-[1.1fr_0.9fr] gap-4 p-5">
            <div className="space-y-3">
              <div className="h-6 w-4/5 border-4 border-black bg-[#FF4D8D]" />
              <div className="h-24 border-4 border-black bg-[#F1F1F1] p-3">
                <div className="mb-2 h-3 w-full bg-black" />
                <div className="mb-2 h-3 w-3/4 bg-black" />
                <div className="h-3 w-5/6 bg-black" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-16 border-4 border-black bg-[#FFD600]" />
                <div className="h-16 border-4 border-black bg-[#B9FF66]" />
                <div className="h-16 border-4 border-black bg-[#FF4D8D]" />
              </div>
            </div>
            <div className="border-4 border-black bg-black p-3 text-xs font-bold text-white">
              <p>app/</p>
              <p className="pl-4 text-[#B9FF66]">layout.tsx</p>
              <p className="pl-4 text-[#FFD600]">page.tsx</p>
              <p>packages/</p>
              <p className="pl-4 text-[#3B82F6]">next</p>
              <p>docs/</p>
              <p className="pl-4 text-[#FF4D8D]">architecture.md</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-center">
          <div className="mb-6 inline-flex w-fit border-4 border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.1em] shadow-[5px_5px_0_#000]">
            Replace github.com with gitglimpse.com
          </div>
          <h1 className="max-w-4xl font-black-display text-5xl uppercase leading-[0.95] tracking-normal sm:text-7xl lg:text-8xl">
            Swap GitHub. Understand Instantly.
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-bold leading-8 sm:text-2xl">
            GitGlimpse turns any public repository URL into a brutalist developer
            dashboard with architecture, stack, file, complexity, and resume signals.
          </p>
          <div className="mt-8">
            <RepoUrlForm />
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {pipelineSteps.map((step, index) => (
            <div
              key={step}
              className="brutal-border-sm bg-[#F1F1F1] p-4 font-black uppercase tracking-[0.08em]"
            >
              <span className="mr-3 inline-flex h-9 w-9 items-center justify-center border-4 border-black bg-[#FFD600]">
                {index + 1}
              </span>
              {step}
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="border-b-4 border-black bg-[#F1F1F1] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <h2 className="font-black-display text-4xl uppercase leading-none sm:text-6xl">
              Repo Intelligence
            </h2>
            <p className="max-w-xl text-lg font-bold leading-7">
              Built for developers who need to understand unfamiliar codebases fast
              and explain them clearly.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {featureTiles.map((feature) => (
              <article
                key={feature.title}
                className={`brutal-border min-h-56 p-5 transition hover:-translate-y-1 ${feature.color}`}
              >
                <h3 className="font-display text-2xl font-black uppercase">
                  {feature.title}
                </h3>
                <p className="mt-5 text-base font-bold leading-7">{feature.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="dashboard" className="border-b-4 border-black bg-[#3B82F6] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-black-display text-4xl uppercase leading-none text-white sm:text-6xl">
              Dashboard Shape
            </h2>
            <p className="mt-6 max-w-xl text-lg font-bold leading-8 text-white">
              The report layout mirrors a real engineering read: overview first,
              source structure next, then proof points a recruiter or teammate can use.
            </p>
          </div>
          <div className="brutal-border bg-white p-4">
            <div className="grid gap-4 md:grid-cols-[180px_1fr]">
              <div className="border-4 border-black bg-[#F1F1F1] p-4 text-sm font-black uppercase leading-8">
                <p>Overview</p>
                <p>File Structure</p>
                <p>AI Summary</p>
                <p>Resume</p>
                <p>Export</p>
              </div>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="border-4 border-black bg-[#FFD600] p-4 font-black">
                    Score
                    <span className="block text-4xl">87</span>
                  </div>
                  <div className="border-4 border-black bg-[#B9FF66] p-4 font-black">
                    Stack
                    <span className="block text-4xl">8</span>
                  </div>
                  <div className="border-4 border-black bg-[#FF4D8D] p-4 font-black">
                    Files
                    <span className="block text-4xl">214</span>
                  </div>
                </div>
                <div className="border-4 border-black bg-black p-4 font-bold text-white">
                  <p>Architecture: App Router, API routes, shared lib layer.</p>
                  <p className="mt-2 text-[#B9FF66]">
                    Resume: Built an AI repository intelligence dashboard...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="showcase" className="bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-black-display text-4xl uppercase leading-none sm:text-6xl">
            Popular Glimpses
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {popularRepos.map((repo) => (
              <Link
                key={`${repo.owner}/${repo.repo}`}
                href={`/${repo.owner}/${repo.repo}`}
                className="brutal-border group bg-[#F1F1F1] p-5 transition hover:-translate-y-1"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={repo.image}
                    alt={`${repo.owner} avatar`}
                    width={64}
                    height={64}
                    className="border-4 border-black bg-white"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-display text-2xl font-black">
                      {repo.owner}/{repo.repo}
                    </p>
                    <p className="mt-1 text-sm font-black uppercase tracking-[0.08em]">
                      Open Glimpse
                    </p>
                  </div>
                </div>
                <div
                  className={`mt-5 inline-flex border-4 border-black px-3 py-2 text-sm font-black uppercase tracking-[0.08em] ${repo.accent}`}
                >
                  gitglimpse.com/{repo.owner}/{repo.repo}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
