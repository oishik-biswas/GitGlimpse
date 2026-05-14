import {
  fetchRepositoryAnalysis,
  GitHubRequestError,
} from "../../../../lib/github";

type AnalyzeRouteContext = {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
};

export async function GET(_request: Request, context: AnalyzeRouteContext) {
  const { owner, repo } = await context.params;

  try {
    const analysis = await fetchRepositoryAnalysis(owner, repo);

    return Response.json(analysis, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    const status = error instanceof GitHubRequestError ? error.status : 500;
    const message =
      error instanceof Error
        ? error.message
        : "Repository analysis failed unexpectedly.";

    return Response.json(
      {
        error: message,
      },
      {
        status,
      },
    );
  }
}
