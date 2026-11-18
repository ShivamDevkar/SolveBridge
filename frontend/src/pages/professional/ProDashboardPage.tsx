import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Star, Clock, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiProblemAdapter } from "@/services/http/problemAdapter";
import { apiProposalAdapter } from "@/services/http/proposalAdapter";
import { apiJobAdapter } from "@/services/http/jobAdapter";
import { apiFetch } from "@/lib/api";
import type { Problem } from "@/types/problem";
import type { Proposal } from "@/types/proposal";
import type { Job } from "@/types/job";

interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
}

function relativeTime(value: string): string {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "Recently";
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function ProDashboardPage() {
  const { user } = useAuth();
  const [matchingProblems, setMatchingProblems] = useState<Problem[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary>({
    averageRating: 0,
    totalReviews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const [problems, proposalList, jobList, reviewsResponse] = await Promise.all([
          apiProblemAdapter.getProblems(),
          apiProposalAdapter.getProposalsByProfessional(user?.id || ""),
          apiJobAdapter.getJobs({ role: "PROFESSIONAL", userId: user?.id }),
          apiFetch<{ data: { summary: ReviewSummary } }>("/api/v1/reviews/mine"),
        ]);

        if (!mounted) return;
        setMatchingProblems(
          problems
            .filter((problem) => problem.status === "OPEN" || problem.status === "PROPOSALS_RECEIVED")
            .slice(0, 6),
        );
        setProposals(proposalList);
        setJobs(jobList);
        setReviewSummary(reviewsResponse.data.summary);
      } catch (error) {
        console.error("Failed to load professional dashboard:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const activeJobs = jobs.filter((job) =>
    [
      "SCHEDULED",
      "ON_THE_WAY",
      "ARRIVED",
      "INSPECTION",
      "IN_PROGRESS",
      "COMPLETED",
      "DISPUTED",
    ].includes(job.status),
  );
  const activeProposals = proposals.filter(
    (proposal) => proposal.status === "SUBMITTED" || proposal.status === "VIEWED",
  );
  const confirmedJobs = jobs.filter(
    (job) => job.status === "CUSTOMER_CONFIRMED" || job.status === "CLOSED",
  );
  const now = new Date();
  const monthEarnings = confirmedJobs.reduce((total, job) => {
    const confirmationDate = job.customerConfirmedAt
      ? new Date(job.customerConfirmedAt)
      : new Date(job.closedAt || job.createdAt);
    if (
      !Number.isNaN(confirmationDate.getTime()) &&
      confirmationDate.getMonth() === now.getMonth() &&
      confirmationDate.getFullYear() === now.getFullYear()
    ) {
      return total + job.currentAmount;
    }
    return total;
  }, 0);
  const displayName =
    user?.businessName ||
    user?.name ||
    "Professional";

  return (
    <div className="space-y-6">
      {/* Workbench Header */}
      <div className="p-6 rounded-2xl bg-linear-to-r from-amber-50 via-orange-50/40 to-white border border-amber-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Professional Workbench
            </span>
            {user?.verificationStatus === "VERIFIED" && (
              <Badge variant="verified" />
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
            You have{" "}
            <strong className="text-purple-700 font-semibold">
              {matchingProblems.length} matching job request{matchingProblems.length === 1 ? "" : "s"}
            </strong>{" "}
            {user?.coverageRadius ? `within your ${user.coverageRadius}km service radius` : "available to you"}{" and "}
            <strong className="text-emerald-700 font-semibold">
              {activeJobs.length} active job{activeJobs.length === 1 ? "" : "s"}
            </strong>
            .
          </p>
        </div>
        <Link to="/pro/matching-problems">
          <Button
            variant="primary"
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm border border-amber-500/30"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Inspect Matching Jobs
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Matching Leads</p>
            <p className="text-2xl font-bold text-purple-700 font-mono mt-1">
              {isLoading ? "—" : matchingProblems.length}
            </p>
            <span className="text-[10px] text-slate-500">
              Based on skills & radius
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">
              Active Proposals
            </p>
            <p className="text-2xl font-bold text-blue-700 font-mono mt-1">
              {isLoading ? "—" : activeProposals.length}
            </p>
            <span className="text-[10px] text-slate-500">
              Awaiting customer selection
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Month Earnings</p>
            <p className="text-2xl font-bold text-emerald-700 font-mono mt-1">
              ₹{monthEarnings.toLocaleString("en-IN")}
            </p>
            <span className="text-[10px] text-slate-500">
              {confirmedJobs.length} confirmed job{confirmedJobs.length === 1 ? "" : "s"}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">
              Verified Rating
            </p>
            <p className="text-2xl font-bold text-amber-700 font-mono mt-1 flex items-center gap-1">
              {reviewSummary.averageRating.toFixed(1)}{" "}
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </p>
            <span className="text-[10px] text-slate-500">
              {reviewSummary.totalReviews} verified review{reviewSummary.totalReviews === 1 ? "" : "s"}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Matching Jobs Teaser */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Live Matching Requests
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              ⚡ Explainable Algorithm
            </span>
          </div>
          <Link
            to="/pro/matching-problems"
            className="text-xs text-amber-700 hover:underline font-semibold"
          >
            View All Matching Jobs →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading && (
            <Card className="md:col-span-2">
              <CardContent className="p-6 text-center text-xs text-slate-500">
                Loading matching requests...
              </CardContent>
            </Card>
          )}
          {!isLoading && matchingProblems.length === 0 && (
            <Card className="md:col-span-2">
              <CardContent className="p-6 text-center text-xs text-slate-500">
                No matching requests are currently available.
              </CardContent>
            </Card>
          )}
          {matchingProblems.map((p) => (
            <Card
              key={p.id}
              className="hover:border-amber-300 hover:shadow-card transition-all"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-amber-700 font-semibold">
                    #{p.id.slice(0, 8)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="urgency" urgency={p.urgency} />
                  </div>
                </div>
                <CardTitle className="text-sm mt-1 text-slate-900 font-bold">
                  {p.title}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  {p.category} • {relativeTime(p.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1 pb-3 text-xs text-slate-600 space-y-1">
                <p className="flex items-center gap-1.5 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Location:{" "}
                  <strong className="text-slate-900">
                    {p.location.neighborhood}, {p.location.city}
                  </strong>
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  * Customer street address is masked during matching and
                  revealed upon proposal selection.
                </p>
              </CardContent>
              <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link
                  to={`/pro/matching-problems/${p.id}`}
                  className="text-slate-600 hover:text-slate-900 font-medium"
                >
                  Inspect Problem
                </Link>
                <Link to={`/pro/matching-problems/${p.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    rightIcon={<ArrowRight className="w-3 h-3" />}
                  >
                    Draft Proposal
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
