export type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  size: number;
  topics?: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  license: {
    name: string;
    spdx_id: string;
  } | null;
};

export type GitHubContributor = {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
};

type GitTreeItem = {
  path: string;
  mode: string;
  type: "blob" | "tree" | "commit";
  size?: number;
};

type GitTreeResponse = {
  tree: GitTreeItem[];
  truncated: boolean;
};

type PackageJson = {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

export type TreeNode = {
  name: string;
  path: string;
  type: "file" | "folder";
  children: TreeNode[];
};

export type FolderInsight = {
  name: string;
  files: number;
  explanation: string;
};

export type FileInsight = {
  path: string;
  reason: string;
};

export type LanguageSlice = {
  name: string;
  bytes: number;
  percentage: number;
  color: string;
};

export type RepositoryAnalysis = {
  repository: GitHubRepository;
  languages: LanguageSlice[];
  contributors: GitHubContributor[];
  readmeExcerpt: string;
  techStack: string[];
  dependencies: string[];
  devDependencies: string[];
  scripts: string[];
  architecture: string[];
  folderBreakdown: FolderInsight[];
  importantFiles: FileInsight[];
  fileTree: TreeNode[];
  complexityScore: number;
  complexityLabel: string;
  summary: string;
  setupGuide: string[];
  resumeBullets: string[];
  talkingPoints: string[];
  suggestions: string[];
  generatedAt: string;
  treeTruncated: boolean;
  warnings?: string[];
};

export class GitHubRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GitHubRequestError";
    this.status = status;
  }
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3B82F6",
  JavaScript: "#FFD600",
  CSS: "#FF4D8D",
  HTML: "#B9FF66",
  Python: "#306998",
  Go: "#00ADD8",
  Rust: "#DEA584",
  Java: "#F89820",
  PHP: "#777BB4",
  Ruby: "#CC342D",
  Shell: "#89E051",
  MDX: "#000000",
};

const FOLDER_EXPLANATIONS: Record<string, string> = {
  app: "App Router entry points, layouts, route handlers, and server-first UI surfaces.",
  pages: "Legacy Pages Router routes and API endpoints.",
  components: "Reusable interface pieces that shape the product experience.",
  src: "Primary application source grouped away from project configuration.",
  lib: "Shared business logic, adapters, and data helpers.",
  utils: "Small reusable helpers used across features.",
  public: "Static assets served directly by the app.",
  styles: "Global or modular styling assets.",
  tests: "Automated checks that protect core behavior.",
  test: "Automated checks that protect core behavior.",
  docs: "Project documentation and implementation notes.",
  api: "Backend endpoints and request handlers.",
};

const IMPORTANT_FILE_RULES: Array<[RegExp, string]> = [
  [/^package\.json$/, "Declares runtime scripts, dependencies, and framework signals."],
  [/^next\.config\.(js|mjs|ts)$/, "Controls Next.js behavior and deployment assumptions."],
  [/^app\/layout\.(tsx|jsx|ts|js)$/, "Defines the root shell that wraps every App Router route."],
  [/^app\/page\.(tsx|jsx|ts|js)$/, "Implements the main product entry screen."],
  [/^app\/api\/.+\/route\.(tsx|ts|js)$/, "Exposes backend-for-frontend API routes."],
  [/^tsconfig\.json$/, "Defines TypeScript strictness and module resolution."],
  [/^tailwind\.config\.(js|ts|mjs)$/, "Configures design tokens and Tailwind scanning."],
  [/^README\.md$/i, "Explains the project, setup, and intended usage."],
  [/^docker-compose\.ya?ml$/, "Signals containerized infrastructure for local development."],
  [/^prisma\/schema\.prisma$/, "Defines database models and persistence contracts."],
];

function githubHeaders(accept = "application/vnd.github+json") {
  const headers: HeadersInit = {
    Accept: accept,
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

function cleanSegment(value: string) {
  return decodeURIComponent(value).trim().replace(/\.git$/i, "");
}

async function fetchGitHubJson<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: githubHeaders(),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new GitHubRequestError(
      `GitHub request failed with ${response.status}`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

async function fetchGitHubText(path: string) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: githubHeaders("application/vnd.github.raw+json"),
    next: { revalidate: 3600 },
  });

  if (response.status === 404) {
    return "";
  }

  if (!response.ok) {
    throw new GitHubRequestError(
      `GitHub raw request failed with ${response.status}`,
      response.status,
    );
  }

  return response.text();
}

function languageBreakdown(languages: Record<string, number>) {
  const total = Object.values(languages).reduce((sum, value) => sum + value, 0);

  return Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: total ? Math.round((bytes / total) * 100) : 0,
      color: LANGUAGE_COLORS[name] ?? "#FFFFFF",
    }));
}

function summarizeReadme(readme: string, fallback: string | null) {
  const withoutCode = readme
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]+]\([^)]*\)/g, (match) => match.replace(/\((.*?)\)/, ""))
    .replace(/^#+\s*/gm, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!withoutCode) {
    return fallback ?? "No README summary is available yet.";
  }

  return withoutCode.length > 420
    ? `${withoutCode.slice(0, 417).trim()}...`
    : withoutCode;
}

function detectPackageManager(paths: string[]) {
  if (paths.includes("pnpm-lock.yaml")) return "pnpm install";
  if (paths.includes("yarn.lock")) return "yarn install";
  if (paths.includes("bun.lockb")) return "bun install";
  if (paths.includes("package-lock.json")) return "npm install";
  return "npm install";
}

function parsePackageJson(rawPackageJson: string): PackageJson {
  if (!rawPackageJson) {
    return {};
  }

  try {
    return JSON.parse(rawPackageJson) as PackageJson;
  } catch {
    return {};
  }
}

function inferTechStack(
  repo: GitHubRepository,
  packageJson: PackageJson,
  languages: LanguageSlice[],
  paths: string[],
) {
  const dependencyNames = new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
  ]);
  const stack = new Set<string>();

  languages.slice(0, 5).forEach((language) => stack.add(language.name));

  if (dependencyNames.has("next")) stack.add("Next.js");
  if (dependencyNames.has("react")) stack.add("React");
  if (dependencyNames.has("tailwindcss")) stack.add("Tailwind CSS");
  if (dependencyNames.has("typescript") || paths.includes("tsconfig.json")) {
    stack.add("TypeScript");
  }
  if (dependencyNames.has("@prisma/client") || paths.includes("prisma/schema.prisma")) {
    stack.add("Prisma");
  }
  if (dependencyNames.has("mongoose") || dependencyNames.has("mongodb")) {
    stack.add("MongoDB");
  }
  if (dependencyNames.has("redis") || dependencyNames.has("@upstash/redis")) {
    stack.add("Redis");
  }
  if (dependencyNames.has("openai")) stack.add("OpenAI API");
  if (paths.some((path) => path.startsWith(".github/workflows/"))) {
    stack.add("GitHub Actions");
  }
  if (repo.language) stack.add(repo.language);

  return Array.from(stack).slice(0, 10);
}

function inferArchitecture(paths: string[], packageJson: PackageJson) {
  const deps = new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
  ]);
  const notes: string[] = [];

  if (paths.some((path) => path.startsWith("app/")) && deps.has("next")) {
    notes.push("Next.js App Router with server-rendered route segments.");
  }

  if (paths.some((path) => path.startsWith("app/api/"))) {
    notes.push("Backend-for-frontend API routes live beside the UI.");
  }

  if (paths.some((path) => path.startsWith("components/"))) {
    notes.push("Reusable components separate product UI from route composition.");
  }

  if (paths.some((path) => path.startsWith("lib/") || path.startsWith("src/lib/"))) {
    notes.push("Shared library code centralizes data access and domain logic.");
  }

  if (paths.some((path) => path.startsWith(".github/workflows/"))) {
    notes.push("CI workflows are present for automated validation.");
  }

  if (paths.some((path) => path.startsWith("prisma/"))) {
    notes.push("Prisma schema files indicate a typed relational persistence layer.");
  }

  return notes.length
    ? notes
    : ["Repository structure is lightweight, with core behavior concentrated near the root."];
}

function buildFolderBreakdown(items: GitTreeItem[]) {
  const counts = new Map<string, number>();

  items.forEach((item) => {
    const [top] = item.path.split("/");

    if (!top || top.startsWith(".")) {
      return;
    }

    counts.set(top, (counts.get(top) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, files]) => ({
      name,
      files,
      explanation:
        FOLDER_EXPLANATIONS[name] ??
        "Project area that groups related implementation files and assets.",
    }));
}

function buildImportantFiles(paths: string[]) {
  return IMPORTANT_FILE_RULES.flatMap(([pattern, reason]) => {
    const match = paths.find((path) => pattern.test(path));
    return match ? [{ path: match, reason }] : [];
  }).slice(0, 8);
}

function insertTreeNode(nodes: TreeNode[], pathParts: string[], fullPath: string) {
  const [current, ...rest] = pathParts;

  if (!current) {
    return;
  }

  if (rest.length === 0) {
    nodes.push({
      name: current,
      path: fullPath,
      type: "file",
      children: [],
    });
    return;
  }

  let folder = nodes.find((node) => node.name === current && node.type === "folder");

  if (!folder) {
    folder = {
      name: current,
      path: fullPath.split("/").slice(0, -rest.length).join("/"),
      type: "folder",
      children: [],
    };
    nodes.push(folder);
  }

  insertTreeNode(folder.children, rest, fullPath);
}

function buildFileTree(items: GitTreeItem[]) {
  const nodes: TreeNode[] = [];
  const visibleItems = items
    .filter((item) => item.type === "blob")
    .filter((item) => !item.path.includes("node_modules/"))
    .slice(0, 180);

  visibleItems.forEach((item) => insertTreeNode(nodes, item.path.split("/"), item.path));

  return nodes
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((node) => ({
      ...node,
      children: node.children.sort((a, b) => a.name.localeCompare(b.name)).slice(0, 10),
    }))
    .slice(0, 12);
}

function calculateComplexity(
  repo: GitHubRepository,
  languages: LanguageSlice[],
  paths: string[],
  contributors: GitHubContributor[],
) {
  const fileScore = Math.min(paths.length / 18, 35);
  const languageScore = Math.min(languages.length * 6, 24);
  const communityScore = Math.min(contributors.length * 4, 16);
  const repoScore = Math.min(Math.log10(repo.stargazers_count + 1) * 7, 25);

  return Math.max(18, Math.min(98, Math.round(fileScore + languageScore + communityScore + repoScore)));
}

function complexityLabel(score: number) {
  if (score >= 78) return "Large-scale";
  if (score >= 58) return "Production-ready";
  if (score >= 38) return "Intermediate";
  return "Focused";
}

function formatTopic(topic: string) {
  return topic
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildSummary(repo: GitHubRepository, stack: string[], score: number) {
  const projectType = repo.description ?? `${repo.full_name} is an open-source repository`;
  const stackText = stack.slice(0, 4).join(", ") || repo.language || "multiple technologies";

  return `${projectType}. GitGlimpse reads it as a ${complexityLabel(score).toLowerCase()} project built around ${stackText}, with enough structure to discuss architecture, setup, and developer impact.`;
}

function buildSetupGuide(packageManager: string, scripts: string[]) {
  const guide = ["Clone the repository from GitHub.", `Run ${packageManager}.`];

  if (scripts.includes("dev")) {
    guide.push("Start local development with the dev script.");
  } else if (scripts.includes("start")) {
    guide.push("Run the start script after installing dependencies.");
  } else {
    guide.push("Check the README for the main execution command.");
  }

  return guide;
}

function buildResumeBullets(
  repo: GitHubRepository,
  stack: string[],
  score: number,
  folderBreakdown: FolderInsight[],
) {
  const stackText = stack.slice(0, 5).join(", ") || "modern web technologies";
  const moduleText = folderBreakdown
    .slice(0, 3)
    .map((folder) => folder.name)
    .join(", ");

  return [
    `Analyzed and explained ${repo.full_name}, a ${complexityLabel(score).toLowerCase()} repository using ${stackText}.`,
    `Mapped repository architecture across ${moduleText || "core modules"} to identify implementation boundaries and ownership areas.`,
    `Produced recruiter-ready project insights from live GitHub metadata, language statistics, and source tree signals.`,
    `Translated raw repository structure into setup guidance, technical talking points, and improvement opportunities.`,
  ];
}

async function fetchLiveRepositoryAnalysis(owner: string, repo: string) {
  const cleanOwner = cleanSegment(owner);
  const cleanRepo = cleanSegment(repo);
  const encodedOwner = encodeURIComponent(cleanOwner);
  const encodedRepo = encodeURIComponent(cleanRepo);

  const repository = await fetchGitHubJson<GitHubRepository>(
    `/repos/${encodedOwner}/${encodedRepo}`,
  );

  const branch = encodeURIComponent(repository.default_branch);

  const [rawLanguages, contributors, readme, rawTree, rawPackageJson] =
    await Promise.all([
      fetchGitHubJson<Record<string, number>>(
        `/repos/${encodedOwner}/${encodedRepo}/languages`,
      ),
      fetchGitHubJson<GitHubContributor[]>(
        `/repos/${encodedOwner}/${encodedRepo}/contributors?per_page=6`,
      ).catch(() => []),
      fetchGitHubText(`/repos/${encodedOwner}/${encodedRepo}/readme`),
      fetchGitHubJson<GitTreeResponse>(
        `/repos/${encodedOwner}/${encodedRepo}/git/trees/${branch}?recursive=1`,
      ),
      fetchGitHubText(
        `/repos/${encodedOwner}/${encodedRepo}/contents/package.json?ref=${branch}`,
      ).catch(() => ""),
    ]);

  const paths = rawTree.tree.map((item) => item.path);
  const packageJson = parsePackageJson(rawPackageJson);
  const languages = languageBreakdown(rawLanguages);
  const dependencies = Object.keys(packageJson.dependencies ?? {}).sort();
  const devDependencies = Object.keys(packageJson.devDependencies ?? {}).sort();
  const scripts = Object.keys(packageJson.scripts ?? {}).sort();
  const techStack = inferTechStack(repository, packageJson, languages, paths);
  const architecture = inferArchitecture(paths, packageJson);
  const folderBreakdown = buildFolderBreakdown(rawTree.tree);
  const importantFiles = buildImportantFiles(paths);
  const fileTree = buildFileTree(rawTree.tree);
  const score = calculateComplexity(repository, languages, paths, contributors);
  const packageManager = detectPackageManager(paths);

  return {
    repository,
    languages,
    contributors,
    readmeExcerpt: summarizeReadme(readme, repository.description),
    techStack,
    dependencies: dependencies.slice(0, 12),
    devDependencies: devDependencies.slice(0, 12),
    scripts,
    architecture,
    folderBreakdown,
    importantFiles,
    fileTree,
    complexityScore: score,
    complexityLabel: complexityLabel(score),
    summary: buildSummary(repository, techStack, score),
    setupGuide: buildSetupGuide(packageManager, scripts),
    resumeBullets: buildResumeBullets(repository, techStack, score, folderBreakdown),
    talkingPoints: [
      `Why the project uses ${techStack.slice(0, 3).join(", ") || "its current stack"}.`,
      `How the ${folderBreakdown[0]?.name ?? "main"} area shapes the codebase.`,
      `Where caching, API design, or deployment could improve next.`,
    ],
    suggestions: [
      "Add an architecture diagram for faster onboarding.",
      "Document environment variables and production deployment steps.",
      "Tag critical files in the README so newcomers can navigate quickly.",
    ],
    generatedAt: new Date().toISOString(),
    treeTruncated: rawTree.truncated,
  } satisfies RepositoryAnalysis;
}

function buildFallbackAnalysis(owner: string, repo: string, reason: string) {
  const cleanOwner = cleanSegment(owner);
  const cleanRepo = cleanSegment(repo);
  const now = new Date().toISOString();
  const fullName = `${cleanOwner}/${cleanRepo}`;

  return {
    repository: {
      id: 0,
      name: cleanRepo,
      full_name: fullName,
      html_url: `https://github.com/${fullName}`,
      description:
        "Live GitHub metadata is temporarily unavailable, so GitGlimpse is showing a limited report.",
      homepage: null,
      default_branch: "main",
      language: null,
      stargazers_count: 0,
      forks_count: 0,
      watchers_count: 0,
      open_issues_count: 0,
      size: 0,
      topics: [],
      created_at: now,
      updated_at: now,
      pushed_at: now,
      owner: {
        login: cleanOwner,
        avatar_url: `https://github.com/${cleanOwner}.png`,
        html_url: `https://github.com/${cleanOwner}`,
      },
      license: null,
    },
    languages: [],
    contributors: [],
    readmeExcerpt:
      "GitHub did not return repository contents for this request. Add a GITHUB_TOKEN for higher rate limits, then refresh the analysis.",
    techStack: ["GitHub", "Repository Analysis", "Limited Mode"],
    dependencies: [],
    devDependencies: [],
    scripts: [],
    architecture: [
      "Live source tree inspection is unavailable in limited mode.",
      "The dashboard and export workflow still work with the current route context.",
    ],
    folderBreakdown: [
      {
        name: "source",
        files: 0,
        explanation:
          "Refresh after GitHub access is restored to inspect real source folders.",
      },
      {
        name: "docs",
        files: 0,
        explanation:
          "README and documentation signals will appear here once GitHub returns contents.",
      },
    ],
    importantFiles: [
      {
        path: "README.md",
        reason: "Usually the fastest source of setup and project intent.",
      },
      {
        path: "package.json",
        reason: "Common place for scripts, dependencies, and framework signals.",
      },
    ],
    fileTree: [
      {
        name: "README.md",
        path: "README.md",
        type: "file",
        children: [],
      },
      {
        name: "package.json",
        path: "package.json",
        type: "file",
        children: [],
      },
    ],
    complexityScore: 20,
    complexityLabel: "Limited",
    summary: `${fullName} is ready for GitGlimpse analysis, but GitHub returned a temporary access error. Summary, copy, and export actions are still available in limited mode.`,
    setupGuide: [
      "Open the original repository on GitHub.",
      "Add GITHUB_TOKEN locally for higher GitHub API limits.",
      "Refresh this GitGlimpse page to regenerate the full report.",
    ],
    resumeBullets: [
      `Prepared a GitGlimpse report shell for ${fullName} with exportable summary sections.`,
      "Handled GitHub API rate limits gracefully with a limited-mode analysis fallback.",
    ],
    talkingPoints: [
      "How the product handles upstream API failures without breaking the dashboard.",
      "How a GitHub token improves metadata, README, and source tree coverage.",
    ],
    suggestions: [
      "Set GITHUB_TOKEN in the local environment before running the dev server.",
      "Refresh the summary after GitHub access is restored.",
      "Keep exports available even when upstream metadata is partial.",
    ],
    generatedAt: now,
    treeTruncated: false,
    warnings: [reason],
  } satisfies RepositoryAnalysis;
}

export async function fetchRepositoryAnalysis(owner: string, repo: string) {
  try {
    return await fetchLiveRepositoryAnalysis(owner, repo);
  } catch (error) {
    if (error instanceof GitHubRequestError && error.status === 403) {
      return buildFallbackAnalysis(owner, repo, error.message);
    }

    throw error;
  }
}

export function repoTopics(repository: GitHubRepository) {
  return (repository.topics ?? []).slice(0, 6).map(formatTopic);
}
