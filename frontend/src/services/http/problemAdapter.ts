import { apiFetch } from "@/lib/api";
import type { CreateProblemPayload, Problem, ProblemMetrics } from "@/types/problem";
import type { IProblemService, ProblemFilterOptions } from "../problemService";
import { mapProblem, toCategorySlug, type ApiJob, type ApiProblem } from "./mappers";

function buildListQuery(filters?: ProblemFilterOptions): string {
  const params = new URLSearchParams({ pageSize: "50" });

  if (filters?.status && filters.status !== "ALL") {
    params.set("status", filters.status);
  }
  if (filters?.urgency) {
    params.set("urgency", filters.urgency);
  }
  if (filters?.category) {
    const slug = toCategorySlug(filters.category);
    if (slug) params.set("category", slug);
  }
  if (filters?.searchQuery) {
    params.set("search", filters.searchQuery);
  }

  return params.toString();
}

class ApiProblemAdapter implements IProblemService {
  async getProblems(_customerId?: string, filters?: ProblemFilterOptions): Promise<Problem[]> {
    const response = await apiFetch<{ data: { problems: ApiProblem[] } }>(
      `/api/v1/problems?${buildListQuery(filters)}`,
    );

    return (response.data?.problems ?? []).map(mapProblem);
  }

  async getProblemById(id: string): Promise<Problem | null> {
    try {
      const response = await apiFetch<{ data: { problem: ApiProblem } }>(
        `/api/v1/problems/${encodeURIComponent(id)}`,
      );
      return mapProblem(response.data.problem);
    } catch {
      return null;
    }
  }

  async createProblem(
    payload: CreateProblemPayload,
    _customerId: string,
    _customerName: string,
  ): Promise<Problem> {
    const categorySlug = toCategorySlug(payload.category);

    const response = await apiFetch<{ data: { problem: ApiProblem } }>("/api/v1/problems", {
      method: "POST",
      body: JSON.stringify({
        title: payload.title,
        description: payload.description,
        categorySlug,
        categoryName: categorySlug ? undefined : payload.category || undefined,
        urgency: payload.urgency,
        budgetMin: payload.budgetMin,
        budgetMax: payload.budgetMax,
        preferredDate: payload.preferredDate || undefined,
        preferredTimeWindow: payload.preferredTimeWindow || undefined,
        city: payload.city,
        neighborhood: payload.neighborhood,
        landmark: payload.landmark,
        images: payload.mediaUrls,
      }),
    });

    return mapProblem(response.data.problem);
  }

  async getProblemMetrics(_customerId?: string): Promise<ProblemMetrics> {
    const [problems, jobsResponse] = await Promise.all([
      this.getProblems(undefined),
      apiFetch<{ data: { jobs: ApiJob[] } }>("/api/v1/jobs?pageSize=50"),
    ]);

    const jobs = jobsResponse.data?.jobs ?? [];
    const activeStatuses = new Set(["OPEN", "MATCHING", "PROPOSALS_RECEIVED"]);

    return {
      activeProblems: problems.filter((problem) => activeStatuses.has(problem.status)).length,
      incomingProposals: problems.reduce(
        (total, problem) =>
          activeStatuses.has(problem.status) ? total + problem.proposalsCount : total,
        0,
      ),
      jobsInProgress: jobs.filter((job) =>
        ["SCHEDULED", "ON_THE_WAY", "ARRIVED", "INSPECTION", "IN_PROGRESS"].includes(job.status),
      ).length,
      resolvedCount: jobs.filter((job) =>
        ["CUSTOMER_CONFIRMED", "CLOSED"].includes(job.status),
      ).length,
    };
  }
}

export const apiProblemAdapter: IProblemService = new ApiProblemAdapter();
