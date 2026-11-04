import { Link } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardTitle,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  PlusCircle,
  MessageSquare,
  Briefcase,
  FileQuestion,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function CustomerDashboardPage() {
  const { user } = useAuth();
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Customer";

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-linear-to-r from-blue-50 via-indigo-50/40 to-white border border-blue-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Customer Portal Hub
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Welcome back, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
            Your posted problems, proposals, and jobs will appear here.
          </p>
        </div>
        <Link to="/customer/problems/new">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Post a New Problem
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Active Problems"
          value={0}
          icon={<FileQuestion className="w-5 h-5" />}
          iconClassName="text-blue-600 bg-blue-50 border-blue-200"
        />
        <MetricCard
          label="Jobs in Progress"
          value={0}
          icon={<Briefcase className="w-5 h-5" />}
          iconClassName="text-emerald-600 bg-emerald-50 border-emerald-200"
        />
        <MetricCard
          label="Active Conversations"
          value={0}
          icon={<MessageSquare className="w-5 h-5" />}
          iconClassName="text-purple-600 bg-purple-50 border-purple-200"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Active Problem Requests
          </h2>
          <Link
            to="/customer/problems"
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            View All Problems →
          </Link>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <FileQuestion className="mx-auto h-10 w-10 text-slate-300" />
            <CardTitle className="mt-3 text-sm text-slate-900">
              No active problem requests yet
            </CardTitle>
            <CardDescription className="mt-1 text-xs text-slate-500">
              Post a problem to start receiving proposals from professionals.
            </CardDescription>
            <Link to="/customer/problems/new" className="mt-4 inline-block">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Post a New Problem
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  iconClassName,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconClassName: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-0.5">
            {value}
          </p>
        </div>
        <div
          className={`w-10 h-10 rounded-xl border flex items-center justify-center ${iconClassName}`}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
