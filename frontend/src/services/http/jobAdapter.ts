import { apiFetch } from "@/lib/api";
import type { Job, JobActivityEvent, JobLifecycleStatus } from "@/types/job";
import type { IJobService, JobActor, JobFilterOptions } from "../jobService";
import { mapActivity, mapJob, toFutureIso, type ApiJob, type ApiStatusEvent } from "./mappers";

interface JobDetailResponse {
  data: { job: ApiJob; statusHistory: ApiStatusEvent[] };
}

class ApiJobAdapter implements IJobService {
  async getJobs(filters?: JobFilterOptions): Promise<Job[]> {
    const params = new URLSearchParams({ pageSize: "50" });
    if (filters?.status && filters.status !== "ALL") {
      params.set("status", filters.status);
    }

    const response = await apiFetch<{ data: { jobs: ApiJob[] } }>(
      `/api/v1/jobs?${params.toString()}`,
    );

    return (response.data?.jobs ?? []).map((job) => mapJob(job));
  }

  async getJobById(jobId: string): Promise<Job | null> {
    try {
      const response = await apiFetch<JobDetailResponse>(
        `/api/v1/jobs/${encodeURIComponent(jobId)}`,
      );
      return mapJob(response.data.job, response.data.statusHistory);
    } catch {
      return null;
    }
  }

  async updateJobStatus(
    jobId: string,
    nextStatus: JobLifecycleStatus,
    _actor: JobActor,
    reason?: string,
  ): Promise<Job> {
    const path =
      nextStatus === "CUSTOMER_CONFIRMED"
        ? `/api/v1/jobs/${encodeURIComponent(jobId)}/confirm`
        : nextStatus === "CANCELLED"
          ? `/api/v1/jobs/${encodeURIComponent(jobId)}/cancel`
          : `/api/v1/jobs/${encodeURIComponent(jobId)}/status`;

    const body =
      nextStatus === "CUSTOMER_CONFIRMED"
        ? { notes: reason }
        : nextStatus === "CANCELLED"
          ? { reason }
          : { status: nextStatus, reason };

    const response = await apiFetch<{ data: { job: ApiJob } }>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });

    return mapJob(response.data.job);
  }

  async updateJobSchedule(
    jobId: string,
    newScheduledAt: string,
    _actor: JobActor,
    note?: string,
  ): Promise<Job> {
    const response = await apiFetch<{ data: { job: ApiJob } }>(
      `/api/v1/jobs/${encodeURIComponent(jobId)}/schedule`,
      {
        method: "PATCH",
        body: JSON.stringify({ scheduledAt: toFutureIso(newScheduledAt), note }),
      },
    );

    return mapJob(response.data.job);
  }

  async addProgressUpdate(jobId: string, note: string, _actor: JobActor): Promise<JobActivityEvent> {
    const response = await apiFetch<{ data: { event: ApiStatusEvent } }>(
      `/api/v1/jobs/${encodeURIComponent(jobId)}/updates`,
      {
        method: "POST",
        body: JSON.stringify({ note }),
      },
    );

    return mapActivity(response.data.event);
  }

  async requestJobCompletion(
    jobId: string,
    summary: { workDone: string; notes?: string },
    _actor: JobActor,
  ): Promise<Job> {
    const reason = [summary.workDone, summary.notes].filter(Boolean).join(" — ");

    const response = await apiFetch<{ data: { job: ApiJob } }>(
      `/api/v1/jobs/${encodeURIComponent(jobId)}/status`,
      {
        method: "POST",
        body: JSON.stringify({ status: "COMPLETED", reason }),
      },
    );

    return mapJob(response.data.job);
  }

  async confirmJobCompletion(jobId: string, _actor: JobActor, feedbackNote?: string): Promise<Job> {
    const response = await apiFetch<{ data: { job: ApiJob } }>(
      `/api/v1/jobs/${encodeURIComponent(jobId)}/confirm`,
      {
        method: "POST",
        body: JSON.stringify({ notes: feedbackNote }),
      },
    );

    return mapJob(response.data.job);
  }

  async closeJob(jobId: string, _actor: JobActor): Promise<Job> {
    const response = await apiFetch<{ data: { job: ApiJob } }>(
      `/api/v1/jobs/${encodeURIComponent(jobId)}/close`,
      { method: "POST" },
    );
    return mapJob(response.data.job);
  }

  async getJobActivities(jobId: string): Promise<JobActivityEvent[]> {
    const response = await apiFetch<JobDetailResponse>(
      `/api/v1/jobs/${encodeURIComponent(jobId)}`,
    );

    return (response.data?.statusHistory ?? []).map(mapActivity);
  }
}

export const apiJobAdapter: IJobService = new ApiJobAdapter();
