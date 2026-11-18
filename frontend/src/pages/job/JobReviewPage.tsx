import { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Star, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { JobWorkspaceContextType } from '@/layouts/JobWorkspaceLayout';

const ratingFields = [
  ['quality', 'Quality'],
  ['professionalism', 'Professionalism'],
  ['timeliness', 'Punctuality'],
  ['value', 'Value'],
] as const;

export function JobReviewPage() {
  const { job } = useOutletContext<JobWorkspaceContextType>();
  const { role } = useAuth();
  const [ratings, setRatings] = useState({
    overall: 0,
    quality: 0,
    professionalism: 0,
    timeliness: 0,
    value: 0,
  });
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!job) return null;

  const canReview = role === 'CUSTOMER' && job.status === 'CUSTOMER_CONFIRMED';
  const setRating = (field: keyof typeof ratings, value: number) =>
    setRatings((current) => ({ ...current, [field]: value }));

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (Object.values(ratings).some((rating) => rating < 1)) {
      setError('Please provide a rating from 1 to 5 for every category.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/api/v1/jobs/${encodeURIComponent(job.id)}/review`, {
        method: 'POST',
        body: JSON.stringify({
          overallRating: ratings.overall,
          qualityRating: ratings.quality,
          professionalismRating: ratings.professionalism,
          timelinessRating: ratings.timeliness,
          valueRating: ratings.value,
          comment: comment.trim() || undefined,
        }),
      });
      setSuccess(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const stars = (field: keyof typeof ratings) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          type="button"
          key={value}
          onClick={() => setRating(field, value)}
          className="p-0.5"
          aria-label={`${value} stars`}
        >
          <Star
            className={`w-6 h-6 ${
              value <= ratings[field]
                ? 'fill-amber-400 text-amber-500'
                : 'fill-slate-100 text-slate-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link
        to={`/jobs/${job.id}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Job Workspace
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Verified Job Review</CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">Review submitted</h2>
              <p className="text-sm text-slate-600">
                Your rating for {job.professionalName} has been published.
              </p>
              <Link to={`/jobs/${job.id}`}>
                <Button size="sm">Return to Job</Button>
              </Link>
            </div>
          ) : !canReview ? (
            <div className="py-8 text-center space-y-2">
              <p className="font-semibold text-slate-900">Reviews are not available yet</p>
              <p className="text-sm text-slate-600">
                Only the customer can review a job after customer confirmation.
              </p>
            </div>
          ) : (
            <form onSubmit={submitReview} className="space-y-5">
              <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-xs text-slate-500">Professional</p>
                  <p className="text-sm font-bold text-slate-900">{job.professionalName}</p>
                </div>
                {stars('overall')}
              </div>

              {ratingFields.map(([field, label]) => (
                <div key={field} className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-slate-700">{label}</span>
                  {stars(field)}
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Written feedback
                </label>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  maxLength={2000}
                  rows={5}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share details about the service..."
                />
              </div>

              {error && (
                <p className="text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  {error}
                </p>
              )}

              <Button type="submit" isLoading={submitting} className="w-full">
                Submit Verified Review
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
