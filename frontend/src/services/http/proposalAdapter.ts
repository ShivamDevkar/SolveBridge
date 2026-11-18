import { apiFetch } from "@/lib/api";
import type { Job } from "@/types/job";
import type { Proposal } from "@/types/proposal";
import type {
  CustomerIdentitySummary,
  IProposalService,
  ProIdentitySummary,
  ProposalSelectionResult,
  SubmitProposalPayload,
} from "../proposalService";
import {
  mapJob,
  mapProposal,
  toDurationMinutes,
  toFutureIso,
  type ApiJob,
  type ApiProposal,
} from "./mappers";

class ApiProposalAdapter implements IProposalService {
  async getProposalsForProblem(problemId: string): Promise<Proposal[]> {
    const response = await apiFetch<{ data: { proposals: ApiProposal[] } }>(
      `/api/v1/problems/${encodeURIComponent(problemId)}/proposals`,
    );

    return (response.data?.proposals ?? []).map(mapProposal);
  }

  async getProposalById(id: string): Promise<Proposal | null> {
    try {
      const response = await apiFetch<{ data: { proposal: ApiProposal } }>(
        `/api/v1/proposals/${encodeURIComponent(id)}`,
      );
      return mapProposal(response.data.proposal);
    } catch {
      return null;
    }
  }

  async getProposalsByProfessional(_professionalId: string): Promise<Proposal[]> {
    // The backend scopes this to the authenticated professional.
    const response = await apiFetch<{ data: { proposals: ApiProposal[] } }>(
      "/api/v1/proposals?pageSize=50",
    );

    return (response.data?.proposals ?? []).map(mapProposal);
  }

  async hasProSubmitted(problemId: string, _professionalId: string): Promise<boolean> {
    const proposals = await this.getProposalsByProfessional(_professionalId);
    return proposals.some((proposal) => proposal.problemId === problemId);
  }

  async submitProposal(
    payload: SubmitProposalPayload,
    _pro: ProIdentitySummary,
  ): Promise<Proposal> {
    const response = await apiFetch<{ data: { proposal: ApiProposal } }>(
      `/api/v1/problems/${encodeURIComponent(payload.problemId)}/proposals`,
      {
        method: "POST",
        body: JSON.stringify({
          price: Math.max(1, Math.round(payload.estimatedPrice)),
          estimatedDurationMinutes: toDurationMinutes(payload.estimatedDuration),
          proposedVisitTime: toFutureIso(payload.proposedVisitTime),
          diagnosis: payload.initialDiagnosis,
          includedServices: payload.includedServices,
          excludedServices: payload.excludedServices,
          notes: payload.notes || undefined,
        }),
      },
    );

    return mapProposal(response.data.proposal);
  }

  async selectProposal(
    problemId: string,
    proposalId: string,
    _customer: CustomerIdentitySummary,
  ): Promise<ProposalSelectionResult> {
    const accepted = await apiFetch<{ data: { job: ApiJob } }>(
      `/api/v1/proposals/${encodeURIComponent(proposalId)}/accept`,
      { method: "POST" },
    );

    const allProblemProposals = await this.getProposalsForProblem(problemId);
    const selected = allProblemProposals.find((proposal) => proposal.id === proposalId);

    if (!selected) {
      throw new Error("Proposal not found after acceptance");
    }

    return {
      proposal: selected,
      job: mapJob(accepted.data.job),
      allProblemProposals,
    };
  }

  async getJobs(): Promise<Job[]> {
    const response = await apiFetch<{ data: { jobs: ApiJob[] } }>("/api/v1/jobs?pageSize=50");
    return (response.data?.jobs ?? []).map((job) => mapJob(job));
  }

  async getJobById(jobId: string): Promise<Job | null> {
    try {
      const response = await apiFetch<{ data: { job: ApiJob } }>(
        `/api/v1/jobs/${encodeURIComponent(jobId)}`,
      );
      return mapJob(response.data.job);
    } catch {
      return null;
    }
  }
}

export const apiProposalAdapter: IProposalService = new ApiProposalAdapter();
