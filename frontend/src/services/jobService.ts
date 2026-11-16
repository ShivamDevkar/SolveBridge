import type { Job, JobLifecycleStatus, JobActivityEvent } from '@/types/job';

export interface JobFilterOptions {
  role?: 'CUSTOMER' | 'PROFESSIONAL' | 'ADMIN';
  userId?: string;
  status?: JobLifecycleStatus | 'ALL';
  searchQuery?: string;
}

export interface JobActor {
  id: string;
  name: string;
  role: 'CUSTOMER' | 'PROFESSIONAL' | 'ADMIN';
}

export interface IJobService {
  /**
   * Retrieves all jobs filtered by viewer role, user ID, or status
   */
  getJobs(filters?: JobFilterOptions): Promise<Job[]>;

  /**
   * Retrieves a single job by its ID
   */
  getJobById(jobId: string): Promise<Job | null>;

  /**
   * Updates a job's lifecycle status through valid transitions
   */
  updateJobStatus(
    jobId: string,
    nextStatus: JobLifecycleStatus,
    actor: JobActor,
    reason?: string
  ): Promise<Job>;

  /**
   * Proposes or updates an appointment schedule
   */
  updateJobSchedule(
    jobId: string,
    newScheduledAt: string,
    actor: JobActor,
    note?: string
  ): Promise<Job>;

  /**
   * Posts an operational progress update to the job's activity feed
   */
  addProgressUpdate(
    jobId: string,
    note: string,
    actor: JobActor
  ): Promise<JobActivityEvent>;

  /**
   * Professional submits a completion request with work summary
   */
  requestJobCompletion(
    jobId: string,
    summary: { workDone: string; notes?: string },
    actor: JobActor
  ): Promise<Job>;

  /**
   * Customer confirms service completion and signs off
   */
  confirmJobCompletion(
    jobId: string,
    actor: JobActor,
    feedbackNote?: string
  ): Promise<Job>;

  /**
   * Retrieves all activity feed events for a job
   */
  getJobActivities(jobId: string): Promise<JobActivityEvent[]>;
}
